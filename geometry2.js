/**
 * UI Component: Horizontal Top Menu (Updated)
 */
const TopMenu = (function() {
    const nav = document.createElement('nav');
    nav.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; height: 60px;
        background: #333; color: white; display: flex; align-items: center;
        padding: 0 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 10000;
        justify-content: space-between;
    `;

    const title = document.createElement('div');
    title.innerText = "Geometry Mastery Portal";
    title.style.fontWeight = "bold";

    const btnContainer = document.createElement('div');
    btnContainer.style.display = "flex";
    btnContainer.style.gap = "10px";

    const createBtn = (text, color) => {
        const btn = document.createElement('button');
        btn.innerText = text;
        btn.style.cssText = `
            padding: 8px 16px; font-weight: bold; cursor: pointer;
            background: ${color}; color: white; border: none; border-radius: 4px;
            transition: opacity 0.2s;
        `;
        btn.onmouseover = () => btn.style.opacity = "0.8";
        btn.onmouseout = () => btn.style.opacity = "1";
        return btn;
    };

    const triBtn = createBtn("Right Triangle Explorer", "#007bff");
    const crimeBtn = createBtn("[Crime Scene Explorer]", "#2ecc71");

    btnContainer.append(triBtn, crimeBtn);
    nav.append(title, btnContainer);
    document.body.appendChild(nav);

    return { triBtn, crimeBtn };
})();

/**
 * Core Engine 1: Triangle Similarity
 */
(function triangleSimilarityEngine(menu) {
    let container = null;
    menu.triBtn.onclick = () => {
        if (container) { container.remove(); container = null; return; }
        container = document.createElement('div');
        container.style.cssText = "display: flex; flex-direction: column; gap: 15px; background: white; padding: 25px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); max-width: 1000px; border: 1px solid #ddd; margin: 80px auto 20px;";
        container.innerHTML = "<h3 style='margin-top:0'>Right Triangle Explorer Loaded</h3>";
        document.body.appendChild(container);
    };
})(TopMenu);

/**
 * Core Engine 2: Crime Scene Explorer
 */
(function crimeSceneEngine(menu) {
    let explorerContainer = null;
    let animationFrameId = null;
    let bulletPathHistory = [];

    menu.crimeBtn.onclick = () => {
        if (explorerContainer) {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            explorerContainer.remove();
            explorerContainer = null;
            return;
        }
        initExplorer();
    };

    function initExplorer() {
        explorerContainer = document.createElement('div');
        explorerContainer.style.cssText = "position: fixed; top: 60px; left: 0; width: 100vw; height: calc(100vh - 60px); background: #2c3e50; display: flex; flex-direction: column; color: white; z-index: 9999;";
        document.body.appendChild(explorerContainer);

        const subMenu = document.createElement('div');
        subMenu.style.cssText = "display: flex; background: #1a252f; padding: 10px; gap: 15px; justify-content: center; border-bottom: 2px solid #111;";
        
        const navOptions = [
            { id: 'video', label: 'Video Footage' },
            { id: 'building', label: 'City Registry' },
            { id: 'gun', label: 'Gun Registry' }
        ];

        navOptions.forEach(item => {
            const btn = document.createElement('button');
            btn.innerText = item.label;
            btn.style.cssText = "padding: 8px 15px; cursor: pointer; background: #34495e; color: white; border: 1px solid #7f8c8d; border-radius: 4px;";
            btn.onclick = () => renderView(item.id);
            subMenu.appendChild(btn);
        });
        explorerContainer.appendChild(subMenu);

        const viewStage = document.createElement('div');
        viewStage.style.cssText = "flex-grow: 1; position: relative; padding: 20px; display: flex; flex-direction: column; align-items: center; overflow-y: auto;";
        explorerContainer.appendChild(viewStage);

        const renderView = (id) => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            viewStage.innerHTML = '';
            if (id === 'video') renderVideo(viewStage);
            if (id === 'building') renderBuildings(viewStage);
            if (id === 'gun') renderGuns(viewStage);
        };

        renderView('video');
    }

    function renderVideo(parent) {
        const canvas = document.createElement('canvas');
        canvas.width = 900; canvas.height = 450;
        canvas.style.cssText = "background: #000; border: 5px solid #111; box-shadow: 0 0 20px rgba(0,0,0,0.5);";
        parent.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let frameProgress = 0;
        let isAnimating = true;
        bulletPathHistory = [];
        const bHeight = 350, bWidth = 100, bX = 750, bY = 450 - bHeight;
        const treeTopY = 300; // The Y coordinate where trees peak

        const ui = document.createElement('div');
        ui.style.cssText = "width: 900px; display: flex; justify-content: space-around; align-items: center; margin-top: 15px; background: #1a252f; padding: 15px; border-radius: 8px; border: 2px solid #444;";
        ui.innerHTML = `
            <div style="text-align:center;">
                <label>ANGLE: <span id="sVal">0</span>°</label><br>
                <input type="range" id="aSli" min="0" max="90" value="0" style="width:180px;"><br>
                Estimate: <input type="text" id="aIn" style="width:40px; margin-top:5px;"> °
            </div>
            <div id="dBox" style="opacity:0.2; text-align:center;">
                <label>FORENSIC DISTANCE</label><br>
                Ft: <input type="text" id="dIn" disabled style="width:80px;">
                <button id="vBtn" style="background:#e67e22; color:white; border:none; padding:5px 10px; cursor:pointer;">Search</button>
            </div>
        `;
        parent.appendChild(ui);

        const aSli = ui.querySelector('#aSli'), aIn = ui.querySelector('#aIn'), dBox = ui.querySelector('#dBox'), dIn = ui.querySelector('#dIn');

        function loop() {
            ctx.fillStyle = "#000b1a"; ctx.fillRect(0,0,900,450);
            
            // Draw Forest
            ctx.fillStyle = "#0d2b14";
            for(let i=0; i<600; i+=40) { 
                ctx.beginPath(); ctx.moveTo(i,450); ctx.lineTo(i+30, treeTopY); ctx.lineTo(i+60,450); ctx.fill(); 
            }
            
            // Draw Building
            ctx.fillStyle = "#546e7a"; ctx.fillRect(bX, bY, bWidth, bHeight);
            ctx.fillStyle = "white"; ctx.font="30px Arial"; ctx.fillText("G", bX+35, bY+50);

            // Bullet Logic
            if (isAnimating) {
                const cX = bX - frameProgress, cY = bY + frameProgress;
                // STOP animation as soon as bullet hits the top of the trees (300px)
                if (cY < treeTopY) { 
                    bulletPathHistory.push({x:cX, y:cY}); 
                    frameProgress += 1.4; 
                } else { 
                    isAnimating = false; 
                }
            }

            ctx.fillStyle = "#888"; // Grey Bullet
            bulletPathHistory.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, 7); ctx.fill(); });

            // Cyan Aim Line
            const rad = aSli.value * (Math.PI/180);
            ctx.strokeStyle="#00ffff"; ctx.setLineDash([5,5]);
            ctx.beginPath(); ctx.moveTo(bX, bY); ctx.lineTo(bX-800, bY+(800*Math.tan(rad))); ctx.stroke();
            ui.querySelector('#sVal').innerText = aSli.value;
            
            animationFrameId = requestAnimationFrame(loop);
        }
        loop();

        aIn.oninput = () => {
            const val = parseFloat(aIn.value);
            if (!isNaN(val) && Math.abs(val - 45) <= 1) { dBox.style.opacity = "1"; dIn.disabled = false; }
            else { dBox.style.opacity = "0.2"; dIn.disabled = true; }
        };

        ui.querySelector('#vBtn').onclick = () => {
            if (Math.abs(parseFloat(dIn.value) - 200) <= 4) renderSuccess(parent);
            else alert("No evidence found.");
        };
    }

    function renderSuccess(p) {
        p.innerHTML = `<div style="text-align:center; padding-top:20px;">
            <h2 style="color:#2ecc71;">EVIDENCE RECOVERED</h2>
            <div style="background:white; color:black; padding:20px; border-radius:10px; display:inline-block;">
                <p style="font-size:20px; font-weight:bold;">FOUND: <span style="color:red">BULLET B20</span></p>
                <div style="width:20px; height:20px; background:#888; border-radius:50%; margin: 10px auto;"></div>
            </div>
        </div>`;
    }

    function renderBuildings(p) {
        let h = "<div style='background:#fdf6e3; color:#5d4037; padding:20px; width:400px; font-family:serif;'><h3>BUILDING REGISTRY</h3>";
        "ABCDEFHIJKL".split('').forEach(l => h += `<div style='display:flex; justify-content:space-between;'><span>Bldg ${l}</span><span>${Math.floor(Math.random()*100+100)}ft</span></div>`);
        h += "<div style='display:flex; justify-content:space-between; font-weight:bold;'><span>Bldg G</span><span>200ft</span></div></div>";
        p.innerHTML = h;
    }

    function renderGuns(p) {
        let h = "<div style='background:white; color:black; padding:20px; width:500px;'><h3>GUN REGISTRY</h3><table style='width:100%'>";
        for(let i=1; i<=15; i++) {
            const ammo = (i===3 || i===12) ? "B20" : "B"+i;
            h += `<tr><td>Citizen ${i}</td><td><b>${ammo}</b></td></tr>`;
        }
        p.innerHTML = h + "</table></div>";
    }

})(TopMenu);
