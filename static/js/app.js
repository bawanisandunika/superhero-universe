// Update timestamp
function updateTimestamp() {
    const now = new Date();
    document.getElementById('update-time').textContent = now.toLocaleString();
}
updateTimestamp();
setInterval(updateTimestamp, 60000); // Update every minute

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show';
    
    // Set color based on type
    if (type === 'success') {
        toast.style.backgroundColor = '#4caf50';
    } else if (type === 'error') {
        toast.style.backgroundColor = '#f44336';
    } else if (type === 'warning') {
        toast.style.backgroundColor = '#ff9800';
    }
    
    setTimeout(() => {
        toast.className = toast.className.replace('show', '');
    }, 3000);
}

// Load initial data with animation
function loadStats() {
    fetch('/api/stats')
        .then(response => response.json())
        .then(data => {
            const statsContainer = document.getElementById('stats-container');
            statsContainer.innerHTML = `
                <div class="stat-item animate__animated animate__fadeIn">
                    <strong><i class="fas fa-users"></i> Total Superheroes:</strong> 
                    <span class="stat-value">${data.total_heroes}</span>
                </div>
                <div class="stat-item animate__animated animate__fadeIn animate__delay-1s">
                    <strong><i class="fas fa-link"></i> Total Connections:</strong> 
                    <span class="stat-value">${data.total_connections}</span>
                </div>
                <div class="stat-item animate__animated animate__fadeIn animate__delay-2s">
                    <strong><i class="fas fa-calendar-plus"></i> Recently Added:</strong> 
                    <span class="stat-value">${data.recent_heroes.join(', ') || 'None'}</span>
                </div>
                <div class="stat-item animate__animated animate__fadeIn animate__delay-3s">
                    <strong><i class="fas fa-trophy"></i> Top Connected:</strong>
                    <ul class="top-list">
                        ${data.top_connected.map(hero => `
                            <li>
                                <span class="hero-name">${hero.emoji} ${hero.name}</span>
                                <span class="connection-count">${hero.connections} connections</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        });
}

// Search hero with animation
function searchHero() {
    const heroName = document.getElementById('hero-search').value.trim();
    if (!heroName) {
        showToast('Please enter a hero name', 'warning');
        return;
    }
    
    const infoContainer = document.getElementById('hero-info-container');
    infoContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
    
    fetch(`/api/hero/${encodeURIComponent(heroName)}`)
        .then(response => response.json())
        .then(data => {
            if (!data) {
                infoContainer.innerHTML = '<div class="no-result animate__animated animate__shakeX"><i class="fas fa-exclamation-circle"></i> Hero not found</div>';
                showToast('Hero not found', 'error');
                return;
            }
            
            infoContainer.innerHTML = `
                <div class="hero-details animate__animated animate__fadeIn">
                    <h3><i class="fas fa-mask"></i> ${data.emoji} ${data.name}</h3>
                    <p><strong><i class="fas fa-calendar-day"></i> Added on:</strong> ${data.created_at}</p>
                    <div class="friends-section">
                        <strong><i class="fas fa-user-friends"></i> Friends:</strong>
                        ${data.friends.length ? 
                            `<ul class="friends-list">
                                ${data.friends.map(friend => `<li><i class="fas fa-user"></i> ${friend.emoji} ${friend.name}</li>`).join('')}
                            </ul>` : 
                            '<span class="no-friends">None</span>'}
                    </div>
                </div>
            `;
            showToast(`Found ${data.name}!`, 'success');
        });
}

// Render D3.js graph with animations and zoom
function renderD3Graph() {
    document.getElementById('graph').style.display = 'block';
    document.getElementById('static-graph').style.display = 'none';
    
    const svg = d3.select("#graph");
    svg.html('<text x="50%" y="50%" text-anchor="middle" fill="#666">Loading interactive graph...</text>');
    
    fetch('/api/graph')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('graph');
            const width = container.clientWidth;
            const height = Math.max(600, container.clientHeight);
            
            svg.attr("width", width)
               .attr("height", height)
               .html('')
               .style("background", "#fff"); // White background for visibility
            
            const g = svg.append("g"); // Group for zoomable content
            
            // Add zoom behavior
            const zoom = d3.zoom()
                .scaleExtent([0.5, 5]) // Zoom limits
                .on("zoom", (event) => {
                    g.attr("transform", event.transform);
                });
            svg.call(zoom);
            
            const color = d3.scaleOrdinal(d3.schemeCategory10);
            
            const simulation = d3.forceSimulation(data.nodes)
                .force("link", d3.forceLink(data.links).id(d => d.id).distance(150)) // Increased distance
                .force("charge", d3.forceManyBody().strength(-500)) // Stronger repulsion
                .force("center", d3.forceCenter(width / 2, height / 2))
                .force("x", d3.forceX(width / 2).strength(0.1))
                .force("y", d3.forceY(height / 2).strength(0.1));
            
            const link = g.append("g")
                .attr("stroke", "#999")
                .attr("stroke-opacity", 0.6)
                .selectAll("line")
                .data(data.links)
                .enter().append("line")
                .attr("stroke-width", 2)
                .style("opacity", 0)
                .transition()
                .duration(1000)
                .style("opacity", 0.6);
            
            const node = g.append("g")
                .selectAll("circle")
                .data(data.nodes)
                .enter().append("circle")
                .attr("class", "node")
                .attr("r", 0)
                .attr("fill", d => color(d.id))
                .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    .on("end", dragended))
                .on("mouseover", function() {
                    d3.select(this).attr("r", 15);
                })
                .on("mouseout", function() {
                    d3.select(this).attr("r", 8); // Smaller base size
                })
                .transition()
                .duration(1000)
                .attr("r", 8);
            
            node.append("title")
                .text(d => `${d.emoji} ${d.name}`);
            
            const label = g.append("g")
                .selectAll("text")
                .data(data.nodes)
                .enter().append("text")
                .attr("dy", -10)
                .text(d => `${d.emoji} ${d.name}`)
                .attr("font-size", "14px") // Larger font
                .attr("text-anchor", "middle")
                .style("fill", "#333")
                .style("opacity", 0)
                .transition()
                .delay(500)
                .duration(1000)
                .style("opacity", 1);
            
            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);
                
                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
                
                label
                    .attr("x", d => d.x)
                    .attr("y", d => d.y);
            });
            
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }
            
            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }
            
            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
            
            showToast('Interactive graph loaded!', 'success');
        });
}

// Show static network image
function showStaticImage() {
    document.getElementById('graph').style.display = 'none';
    const staticGraph = document.getElementById('static-graph');
    staticGraph.style.display = 'block';
    staticGraph.src = '';
    
    // Show loading
    staticGraph.parentNode.insertAdjacentHTML('beforeend', 
        '<div id="image-loading" class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Generating image...</div>');
    
    fetch('/network_image')
        .then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            staticGraph.src = url;
            staticGraph.onload = function() {
                document.getElementById('image-loading').remove();
                showToast('Network image generated!', 'success');
            };
        });
}

// Download network image
function downloadImage() {
    Swal.fire({
        title: 'Download Network Image',
        text: 'Choose the image format you want to download',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'PNG',
        cancelButtonText: 'Cancel',
        showDenyButton: true,
        denyButtonText: 'SVG',
        customClass: {
            confirmButton: 'btn-confirm',
            denyButton: 'btn-deny'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            // Download PNG
            fetch('/network_image')
                .then(response => response.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'superhero_network.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showToast('Image downloaded as PNG!', 'success');
                });
        } else if (result.isDenied) {
            // Download SVG
            fetch('/network_image/svg')
                .then(response => response.blob())
                .then(blob => {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'superhero_network.svg';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showToast('Image downloaded as SVG!', 'success');
                });
        }
    });
}

// Add new hero with confirmation
function addHero() {
    const name = document.getElementById('new-hero-name').value.trim();
    if (!name) {
        showToast('Please enter a hero name', 'warning');
        return;
    }
    
    const date = document.getElementById('new-hero-date').value;
    
    Swal.fire({
        title: 'Add New Superhero?',
        html: `You are about to add <b>${name}</b> to the network.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, add it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/api/add_hero', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    created_at: date || null
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire(
                        'Added!',
                        `Hero ${name} has been added with ID ${data.id}.`,
                        'success'
                    );
                    document.getElementById('new-hero-name').value = '';
                    document.getElementById('new-hero-date').value = '';
                    loadStats();
                    renderD3Graph();
                } else {
                    Swal.fire(
                        'Error!',
                        'There was an error adding the hero.',
                        'error'
                    );
                }
            });
        }
    });
}

// Add new connection with confirmation
function addConnection() {
    const source = document.getElementById('connection-source').value.trim();
    const target = document.getElementById('connection-target').value.trim();
    
    if (!source || !target) {
        showToast('Please enter both source and target heroes', 'warning');
        return;
    }
    
    Swal.fire({
        title: 'Add New Connection?',
        html: `You are about to connect <b>${source}</b> and <b>${target}</b>.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, connect them!',
        cancelButtonText: 'Cancel',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            fetch('/api/add_connection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    source: source,
                    target: target
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire(
                        'Connected!',
                        `${source} and ${target} are now friends.`,
                        'success'
                    );
                    document.getElementById('connection-source').value = '';
                    document.getElementById('connection-target').value = '';
                    loadStats();
                    renderD3Graph();
                } else {
                    Swal.fire(
                        'Oops!',
                        data.message || 'These heroes are already connected or not found.',
                        'info'
                    );
                }
            });
        }
    });
}

// Initialize the page
loadStats();
renderD3Graph();