
        /**
         * UI Component: Horizontal Top Menu
         */
        const TopMenu = (function() {
            const nav = document.createElement('nav');
            nav.style.cssText = `
                position: fixed; top: 0; left: 0; right: 0; height: 60px;
                background: #333; color: white; display: flex; align-items: center;
                padding: 0 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 1000;
                justify-content: space-between;
            `;

            const title = document.createElement('div');
            title.innerText = "Geometry ";
            title.style.fontWeight = "bold";

            const btn = document.createElement('button');
            btn.innerText = "Show Explorer";
            btn.style.cssText = `
                padding: 8px 16px; font-weight: bold; cursor: pointer;
                background: #007bff; color: white; border: none; border-radius: 4px;
                transition: background 0.2s;
            `;
            btn.onmouseover = () => btn.style.background = "#0056b3";
            btn.onmouseout = () => btn.style.background = "#007bff";

            nav.append(title, btn);
            document.body.appendChild(nav);

            return { toggleBtn: btn };
        })();

        /**
         * Core Engine: Triangle Similarity
         */
        (function triangleSimilarityEngine(menu) {
            let container = null;

            menu.toggleBtn.onclick = () => {
                if (container) {
                    container.remove();
                    container = null;
                    menu.toggleBtn.innerText = "Right Triangle Explorer";
                    return;
                }

                menu.toggleBtn.innerText = "Right Triangle Explorer";
                container = document.createElement('div');
                container.style.cssText = "display: flex; flex-direction: column; gap: 15px; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); max-width: 1000px; border: 1px solid #ddd; margin: 20px auto;";

                // 1. Canvas Area
                const canvas = document.createElement('canvas');
                canvas.width = 950; 
                canvas.style.cssText = "background: #fff; border-radius: 8px; border-bottom: 1px solid #eee; width: 100%;";
                
                // 2. Control Panel
                const controls = document.createElement('div');
                controls.style.cssText = "display: grid; grid-template-columns: 1fr 1fr; gap: 30px; padding: 10px 0;";

                const createSlider = (label, min, max, step, val) => {
                    const div = document.createElement('div');
                    div.innerHTML = `<label style="display:block; margin-bottom:8px; font-weight:bold;">${label}: <span class="val-display" style="color:#007bff">${val}</span></label>
                                     <input type="range" min="${min}" max="${max}" step="${step}" value="${val}" style="width:100%; cursor:pointer;">`;
                    return div;
                };

                const angleSlider = createSlider("Angle (θ)", 0.5, 89.5, 0.5, 30);
                const scaleSlider = createSlider("Scale Factor (k)", 1, 5, 0.1, 2.5);
                controls.append(angleSlider, scaleSlider);

                // 3. Stats Panel
                const stats = document.createElement('div');
                stats.style.cssText = "display: grid; grid-template-columns: 1fr 1fr; background: #f9f9f9; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 14px; border: 1px solid #eee; line-height: 1.6;";
                
                container.append(canvas, controls, stats);
                document.body.appendChild(container);

                const ctx = canvas.getContext('2d');
                const aInput = angleSlider.querySelector('input');
                const sInput = scaleSlider.querySelector('input');

                const render = () => {
                    const deg = parseFloat(aInput.value);
                    const k = parseFloat(sInput.value);
                    const rad = deg * (Math.PI / 180);
                    
                    const adj = Math.cos(rad); 
                    const opp = Math.sin(rad); 
                    
                    const m = 100; 
                    const padding = 50;
                    
                    const requiredHeight = (opp * k * m) + (padding * 2);
                    canvas.height = Math.max(140, requiredHeight);

                    angleSlider.querySelector('.val-display').innerText = deg + "°";
                    scaleSlider.querySelector('.val-display').innerText = k.toFixed(1);
                    
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    const groundY = canvas.height - 40;

                    const drawTri = (startX, a, o, h_val, color, prime) => {
                        const bW = a * m;
                        const bH = o * m;
                        const rVX = startX + bW;
                        const rVY = groundY;
                        const lVX = startX;
                        const lVY = groundY;
                        const tVX = startX;
                        const tVY = groundY - bH;

                        ctx.beginPath();
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = color;
                        ctx.moveTo(rVX, rVY);
                        ctx.lineTo(lVX, lVY);
                        ctx.lineTo(tVX, tVY);
                        ctx.closePath();
                        ctx.stroke();

                        const raSize = Math.max(2, Math.min(15, bH * 0.3, bW * 0.3));
                        if (raSize > 3) {
                            ctx.beginPath();
                            ctx.lineWidth = 1;
                            ctx.moveTo(lVX + raSize, lVY);
                            ctx.lineTo(lVX + raSize, lVY - raSize);
                            ctx.lineTo(lVX, lVY - raSize);
                            ctx.stroke();
                        }

                        const arcR = Math.max(5, Math.min(25, bW * 0.4, bH * 0.4));
                        ctx.beginPath();
                        ctx.strokeStyle = "#888";
                        ctx.arc(rVX, rVY, arcR, Math.PI, Math.PI + rad);
                        ctx.stroke();

                        const tSize = Math.max(11, arcR * 0.8);
                        ctx.font = `italic ${tSize}px serif`;
                        const dist = arcR + (tSize * 0.8);
                        const tx = rVX + Math.cos(Math.PI + rad/2) * dist;
                        const ty = rVY + Math.sin(Math.PI + rad/2) * dist;
                        ctx.fillStyle = "#333";
                        ctx.fillText("θ", tx - 4, ty + 4);

                        ctx.font = "bold 11px monospace"; 
                        ctx.fillStyle = color;
                        const p = prime ? "'" : "";
                        ctx.fillText(`adj${p}: ${a.toFixed(3)}`, lVX + bW/2 - 25, groundY + 18);
                        ctx.fillText(`opp${p}: ${o.toFixed(3)}`, lVX - 85, groundY - bH/2);
                        ctx.fillText(`hyp${p}: ${h_val.toFixed(3)}`, lVX + bW/2, groundY - bH/2 - 10);
                    };

                    drawTri(120, adj, opp, 1, "#007bff", false);
                    drawTri(480, adj * k, opp * k, k, "#28a745", true);

                    stats.innerHTML = `
                        <div style="border-right: 1px solid #ddd; padding-right: 15px;">
                            <strong style="color:#007bff">Trigonometry</strong><br>
                            sin(θ) = ${(opp).toFixed(5)}<br>
                            cos(θ) = ${(adj).toFixed(5)}<br>
                            tan(θ) = ${(opp/adj).toFixed(5)}
                        </div>
                        <div style="padding-left: 15px;">
                            <strong style="color:#28a745">Similarity (Scale k)</strong><br>
                            opp'/opp = ${k.toFixed(2)}<br>
                            adj'/adj = ${k.toFixed(2)}<br>
                            hyp'/hyp = ${k.toFixed(2)}
                        </div>`;
                };

                aInput.oninput = render;
                sInput.oninput = render;
                render();
            };
        })(TopMenu);
