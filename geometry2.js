        (function crimeSceneSystem() {
            // --- STATE & SCOPE ---
            let explorerContainer = null;
            let animationFrameId = null;
            let bulletPathHistory = []; 

            // --- MAIN TOGGLE BUTTON ---
            const mainToggle = document.createElement('button');
            mainToggle.innerText = "[Crime Scene Explorer]";
            mainToggle.style.cssText = "position: fixed; top: 10px; right: 10px; padding: 12px 24px; z-index: 10000; cursor: pointer; background: #2ecc71; color: white; border: none; border-radius: 4px; font-weight: bold; box-shadow: 0 4px 10px rgba(0,0,0,0.5);";
            document.body.appendChild(mainToggle);

            mainToggle.onclick = () => {
                if (explorerContainer) {
                    if (animationFrameId) cancelAnimationFrame(animationFrameId);
                    explorerContainer.remove();
                    explorerContainer = null;
                } else {
                    initExplorer();
                }
            };

            function initExplorer() {
                explorerContainer = document.createElement('div');
                explorerContainer.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #2c3e50; display: flex; flex-direction: column; color: white; z-index: 9999;";
                document.body.appendChild(explorerContainer);

                const menu = document.createElement('div');
                menu.style.cssText = "display: flex; background: #1a252f; padding: 15px; gap: 15px; justify-content: center; border-bottom: 2px solid #111; z-index: 10001;";
                
                const navOptions = [
                    { id: 'video', label: 'Video Footage' },
                    { id: 'building', label: 'City’s Building Registry' },
                    { id: 'gun', label: 'City’s Gun Registry' }
                ];

                navOptions.forEach(item => {
                    const btn = document.createElement('button');
                    btn.innerText = item.label;
                    btn.style.cssText = "padding: 10px 20px; cursor: pointer; background: #34495e; color: white; border: 1px solid #7f8c8d; border-radius: 4px; font-weight: bold;";
                    btn.onclick = () => renderView(item.id);
                    menu.appendChild(btn);
                });
                explorerContainer.appendChild(menu);

                const viewStage = document.createElement('div');
                viewStage.style.cssText = "flex-grow: 1; position: relative; padding: 20px; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; overflow-y: auto;";
                explorerContainer.appendChild(viewStage);

                function renderView(id) {
                    if (animationFrameId) cancelAnimationFrame(animationFrameId);
                    viewStage.innerHTML = '';
                    if (id === 'video') renderVideoApp(viewStage);
                    if (id === 'building') renderBuildingApp(viewStage);
                    if (id === 'gun') renderGunApp(viewStage);
                }

                renderView('video');
            }

            // --- SUB APP: VIDEO FOOTAGE ---
            function renderVideoApp(parent) {
                const canvas = document.createElement('canvas');
                canvas.width = 900; canvas.height = 500;
                canvas.style.cssText = "background: #000; border: 5px solid #111; box-shadow: 0 0 20px rgba(0,0,0,0.5);";
                parent.appendChild(canvas);

                const ctx = canvas.getContext('2d');
                let frameProgress = 0;
                let isAnimating = true;
                bulletPathHistory = []; 
                
                const bHeight = 350; const bWidth = 100;
                const bX = 750; const bY = 500 - bHeight; 

                const uiPanel = document.createElement('div');
                uiPanel.style.cssText = "width: 900px; display: flex; justify-content: space-around; align-items: center; margin-top: 15px; background: #1a252f; padding: 20px; border-radius: 8px; border: 2px solid #444; color: white;";
                parent.appendChild(uiPanel);

                uiPanel.innerHTML = `
                    <div style="text-align:center;">
                        <label style="color:#3498db; font-weight:bold; display:block; margin-bottom:10px;">ANGLE ALIGNMENT: <span id="slideVal">0</span>°</label>
                        <input type="range" id="angleSlide" min="0" max="90" value="0" style="width:200px; cursor:pointer;">
                        <div style="margin-top:10px;">
                            Input Angle Estimate: <input type="text" id="angleIn" style="width:60px; padding:5px; background:#2c3e50; color:white; border:1px solid #555; border-radius:4px;"> °
                        </div>
                    </div>
                    <div id="distBlock" style="opacity: 0.2; text-align:center;">
                        <label style="color:#e67e22; font-weight:bold; display:block; margin-bottom:10px;">FORENSIC DISTANCE</label>
                        Horizontal ft: <input type="text" id="distIn" disabled style="width:100px; padding:5px; background:#2c3e50; color:white; border:1px solid #555; border-radius:4px;">
                        <button id="verifyBtn" style="padding:6px 15px; cursor:pointer; background:#e67e22; color:white; border:none; border-radius:4px; margin-left:10px;">Search</button>
                    </div>
                `;

                const angleSlide = uiPanel.querySelector('#angleSlide');
                const slideVal = uiPanel.querySelector('#slideVal');
                const angleIn = uiPanel.querySelector('#angleIn');
                const distBlock = uiPanel.querySelector('#distBlock');
                const distIn = uiPanel.querySelector('#distIn');
                const verifyBtn = uiPanel.querySelector('#verifyBtn');

                angleSlide.oninput = () => { slideVal.innerText = angleSlide.value; };

                function animationLoop() {
                    ctx.fillStyle = "#000b1a"; ctx.fillRect(0,0,900,500);
                    
                    ctx.fillStyle = "#0d2b14";
                    for(let i=0; i<600; i+=40) {
                        ctx.beginPath(); ctx.moveTo(i, 500); ctx.lineTo(i+30, 350); ctx.lineTo(i+60, 500); ctx.fill();
                    }

                    ctx.fillStyle = "#546e7a"; ctx.fillRect(bX, bY, bWidth, bHeight);
                    ctx.fillStyle = "white"; ctx.font = "bold 35px Arial"; ctx.fillText("G", bX + 35, bY + 55);

                    if (isAnimating) {
                        const currentX = bX - frameProgress;
                        const currentY = bY + frameProgress; 
                        if (currentY < 420) { 
                            bulletPathHistory.push({x: currentX, y: currentY});
                            frameProgress += 1.4; // 2x speed adjustment
                        } else { isAnimating = false; }
                    }

                    ctx.fillStyle = "yellow";
                    bulletPathHistory.forEach(p => {
                        ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI*2); ctx.fill();
                    });

                    const uAngle = angleSlide.value * (Math.PI/180);
                    ctx.strokeStyle = "#00ffff"; ctx.lineWidth = 2; ctx.setLineDash([8, 4]);
                    ctx.beginPath(); ctx.moveTo(bX, bY);
                    ctx.lineTo(bX - 800, bY + (800 * Math.tan(uAngle)));
                    ctx.stroke(); ctx.setLineDash([]);

                    animationFrameId = requestAnimationFrame(animationLoop);
                }
                animationLoop();

                angleIn.oninput = () => {
                    const val = parseFloat(angleIn.value);
                    if (!isNaN(val) && Math.abs(val - 45) <= 1) {
                        distBlock.style.opacity = "1";
                        distIn.disabled = false;
                        distIn.style.background = "#fff";
                        distIn.style.color = "#000";
                    } else {
                        distBlock.style.opacity = "0.2";
                        distIn.disabled = true;
                    }
                };

                verifyBtn.onclick = () => {
                    const guess = parseFloat(distIn.value);
                    if (!isNaN(guess) && Math.abs(guess - 200) <= 4) {
                        renderSuccess(parent);
                    } else {
                        alert("No evidence found at those coordinates.");
                    }
                };
            }

            function renderSuccess(p) {
                p.innerHTML = `<div style="text-align:center; padding-top:40px;">
                    <h1 style="color:#2ecc71;">CRIME SOLVED</h1>
                    <canvas id="stickCanvas" width="400" height="200" style="background:#2c3e50; border:4px solid #2ecc71; border-radius:10px;"></canvas>
                    <div style="background:white; color:#333; padding:20px; border-radius:10px; margin-top:20px; display:inline-block;">
                        <p style="font-size:24px; font-weight:bold; margin:0;">EVIDENCE FOUND: <span style="color:#e74c3c">BULLET B20</span></p>
                    </div>
                </div>`;
                
                const sctx = p.querySelector('#stickCanvas').getContext('2d');
                sctx.strokeStyle = "white"; sctx.lineWidth = 3;
                sctx.beginPath(); sctx.arc(100, 50, 20, 0, 7); sctx.moveTo(100,70); sctx.lineTo(100,130); 
                sctx.moveTo(100,90); sctx.lineTo(70,110); sctx.moveTo(100,90); sctx.lineTo(130,110);
                sctx.moveTo(100,130); sctx.lineTo(70,170); sctx.moveTo(100,130); sctx.lineTo(130,170); sctx.stroke();
                sctx.fillStyle = "yellow"; sctx.beginPath(); sctx.arc(200, 170, 6, 0, 7); sctx.fill();
                sctx.font = "bold 20px Arial"; sctx.fillText("B20", 220, 175);
            }

            // --- SUB APP: BUILDING REGISTRY ---
            function renderBuildingApp(parent) {
                const book = document.createElement('div');
                book.style.cssText = "background: #fdf6e3; color: #5d4037; padding: 40px; border-radius: 4px; max-width: 500px; width:90%; height: 70vh; overflow-y: auto; border: 1px solid #d3c6a8; font-family: serif;";
                book.innerHTML = "<h2 style='text-align:center; border-bottom: 2px solid #5d4037;'>MUNICIPAL BUILDING REGISTRY</h2>";
                
                const alpha = "ABCDEFHIJKLMNOPQRSTUVWXYZ".split('');
                const registry = alpha.map(l => ({ name: "Building " + l, h: Math.floor(Math.random()*150)+100 }));
                registry.push({ name: "Building G", h: 200 }); 
                registry.sort((a,b) => a.name.localeCompare(b.name));

                registry.forEach(entry => {
                    const row = document.createElement('div');
                    row.style.cssText = "display:flex; justify-content:space-between; padding: 12px 0; border-bottom: 1px solid #e0d5ba;";
                    row.innerHTML = `<span>${entry.name}</span><strong>${entry.h} ft</strong>`;
                    book.appendChild(row);
                });
                parent.appendChild(book);
            }

            // --- SUB APP: GUN REGISTRY ---
            function renderGunApp(parent) {
                const container = document.createElement('div');
                container.style.cssText = "background: #fff; color: #333; padding: 30px; border-radius: 8px; max-width: 700px; width:90%; height: 70vh; overflow-y: auto;";
                container.innerHTML = "<h2>City Gun Registry</h2>";

                // Generate 20 citizens, shuffle suspect positions
                const db = [];
                const pool = ["B2", "B4", "B9", "B21", "B3"];
                
                // Determine 2 random unique indices for B20 suspects
                let s1 = Math.floor(Math.random() * 5); // Early in book
                let s2 = 10 + Math.floor(Math.random() * 8); // Late in book

                for(let i=1; i<=20; i++) {
                    if (i === s1) {
                        db.push({ owner: "Citizen " + i, model: "Gun 1", ammo: "B20" });
                    } else if (i === s2) {
                        db.push({ owner: "Citizen " + i, model: "Gun 3", ammo: "B20" });
                    } else {
                        const gType = (Math.floor(Math.random()*4)+1);
                        db.push({ owner: "Citizen " + i, model: "Gun " + gType, ammo: pool[Math.floor(Math.random()*pool.length)] });
                    }
                }

                const table = document.createElement('table');
                table.style.width = "100%"; table.style.borderCollapse = "collapse";
                table.innerHTML = "<tr style='background:#eee'><th style='padding:10px; text-align:left;'>Owner</th><th style='text-align:left;'>Weapon</th><th style='text-align:left;'>Ammo Type</th></tr>";
                db.forEach(r => {
                    const tr = document.createElement('tr');
                    tr.style.borderBottom = "1px solid #eee";
                    tr.innerHTML = `<td style='padding:10px'>${r.owner}</td><td>${r.model}</td><td style="font-weight:bold;">${r.ammo}</td>`;
                    table.appendChild(tr);
                });
                container.appendChild(table);
                parent.appendChild(container);
            }
        })();
