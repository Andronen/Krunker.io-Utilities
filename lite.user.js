// ==UserScript==
// @name         Krunker.io Utilities Lite
// @description  Krunker.io Mod
// @updateURL    https://github.com/Tehchy/Krunker.io-Utilities/raw/master/lite.user.js
// @downloadURL  https://github.com/Tehchy/Krunker.io-Utilities/raw/master/lite.user.js
// @version      0.0.1
// @author       Tehchy
// @include      /^(https?:\/\/)?(www\.)?(.+)krunker\.io(|\/|\/\?(server|party|game)=.+)$/
// @grant        none
// @run-at       document-start
// ==/UserScript==

class Utilities {
    constructor() {
        this.fps = {
            cur: 0,
            times: []
        };
        this.canvas = null;
        this.ctx = null;
        this.settings = {
            fpsCounter: false,
            fpsFontSize: 10,
            customCrosshair: 0,
            customCrosshairShape: 0,
            customCrosshairColor: "#FFFFFF",
            customCrosshairLength: 14,
            customCrosshairThickness: 2,
            customCrosshairOutline: 0,
            customCrosshairOutlineColor: "#000000",
            showLeaderboard: true,
        };
        this.settingsMenu = [];
        this.onLoad();
    }

    createCanvas() {
        const hookedCanvas = document.createElement("canvas");
        hookedCanvas.width = innerWidth;
        hookedCanvas.height = innerHeight;
        window.addEventListener('resize', () => {
            hookedCanvas.width = innerWidth;
            hookedCanvas.height = innerHeight;
        });
        this.canvas = hookedCanvas;
        this.ctx = hookedCanvas.getContext("2d");
        const hookedUI = document.getElementById("inGameUI");
        hookedUI.insertAdjacentElement("beforeend", hookedCanvas);
        requestAnimationFrame(this.render.bind(this));
    }

    createMenu() {
        const rh = document.getElementById('rightHolder');
        rh.insertAdjacentHTML("beforeend", "<br/><a href='javascript:;' onmouseover=\"SOUND.play('tick_0',0.1)\" onclick='showWindow(window.windows.length);' class=\"menuLink\">Utilities</a>");
        let self = this;
        this.settingsMenu = {
            fpsCounter: {
                name: "Show FPS",
                pre: "<div class='setHed'><center>Utilities Lite</center></div><div class='setHed'>Render</div><hr>",
                val: 1,
                html() {
                    return `<label class='switch'><input type='checkbox' onclick='window.utilities.setSetting("fpsCounter", this.checked)' ${self.settingsMenu.fpsCounter.val ? "checked" : ""}><span class='slider'></span></label>`;
                },
                set(t) {
                    self.settings.fpsCounter = t;
                }
            },
            fpsFontSize: {
                name: "FPS Font Size",
                val: 10,
                html() {
                    return `<select class="floatR" onchange="window.utilities.setSetting('fpsFontSize', this.value)">
                    <option value="10"${self.settingsMenu.fpsFontSize.val == 10 ? " selected" : ""}>Small</option>
                    <option value="14"${self.settingsMenu.fpsFontSize.val == 14 ? " selected" : ""}>Medium</option>
                    <option value="20"${self.settingsMenu.fpsFontSize.val == 20 ? " selected" : ""}>Large</option>
                    <option value="26"${self.settingsMenu.fpsFontSize.val == 26 ? " selected" : ""}>Giant</option>
                    </select>`
                },
                set(t) {
                    self.settings.fpsFontSize = parseInt(t);
                }
            },
            showLeaderboard: {
                name: "Show Leaderboard",
                val: 1,
                html() {
                    return `<label class='switch'><input type='checkbox' onclick='window.utilities.setSetting("showLeaderboard", this.checked)' ${self.settingsMenu.showLeaderboard.val ? "checked" : ""}><span class='slider'></span></label>`;
                },
                set(t) {
                    self.settings.showLeaderboard = t;
                    document.getElementById('leaderDisplay').style.display = t ? "block" : "none";
                }
            },
            customCrosshair: {
                name: "Style",
                pre: "<br><div class='setHed'>Custom Crosshair</div><hr>",
                val: 0,
                html() {
                    return `<select class="floatR" onchange="window.utilities.setSetting('customCrosshair', this.value)">
                    <option value="0"${self.settingsMenu.customCrosshair.val == 0 ? " selected" : ""}>Original</option>
                    <option value="1"${self.settingsMenu.customCrosshair.val == 1 ? " selected" : ""}>Custom</option>
                    <option value="2"${self.settingsMenu.customCrosshair.val == 2 ? " selected" : ""}>Both</option>
                    </select>`
                },
                set(t) {
                    self.settings.customCrosshair = parseInt(t);
                }
            },
            customCrosshairShape: {
                name: "Shape",
                val: 0,
                html() {
                    return `<select class="floatR" onchange="window.utilities.setSetting('customCrosshairShape', this.value)">
                    <option value="0"${self.settingsMenu.customCrosshairShape.val == 0 ? " selected" : ""}>Cross</option>
                    <option value="1"${self.settingsMenu.customCrosshairShape.val == 1 ? " selected" : ""}>Circle</option>
                    </select>`
                },
                set(t) {
                    self.settings.customCrosshairShape = parseInt(t);
                }
            },
            customCrosshairColor: {
                name: "Color",
                val: "#ffffff",
                html() {
                    return `<input type='color' id='crosshairColor' name='color' value='${self.settingsMenu.customCrosshairColor.val}' oninput='window.utilities.setSetting("customCrosshairColor", this.value)' style='float:right;margin-top:5px'/>`
                },
                set(t) {
                    self.settings.customCrosshairColor = t;
                }
            },
            customCrosshairLength: {
                name: "Length",
                val: 16,
                html() {
                    return `<span class='sliderVal' id='slid_utilities_customCrosshairLength'>${self.settingsMenu.customCrosshairLength.val}</span><div class='slidecontainer'><input type='range' min='4' max='50' step='2' value='${self.settingsMenu.customCrosshairLength.val}' class='sliderM' oninput="window.utilities.setSetting('customCrosshairLength', this.value)"></div>`
                },
                set(t) {
                    self.settings.customCrosshairLength = parseInt(t);
                }
            },
            customCrosshairThickness: {
                name: "Thickness",
                val: 2,
                html() {
                    return `<span class='sliderVal' id='slid_utilities_customCrosshairThickness'>${self.settingsMenu.customCrosshairThickness.val}</span><div class='slidecontainer'><input type='range' min='2' max='20' step='2' value='${self.settingsMenu.customCrosshairThickness.val}' class='sliderM' oninput="window.utilities.setSetting('customCrosshairThickness', this.value)"></div>`
                },
                set(t) {
                    self.settings.customCrosshairThickness = parseInt(t);
                }
            },
            customCrosshairOutline: {
                name: "Outline",
                val: 0,
                html() {
                    return `<span class='sliderVal' id='slid_utilities_customCrosshairOutline'>${self.settingsMenu.customCrosshairOutline.val}</span><div class='slidecontainer'><input type='range' min='0' max='10' step='1' value='${self.settingsMenu.customCrosshairOutline.val}' class='sliderM' oninput="window.utilities.setSetting('customCrosshairOutline', this.value)"></div>`
                },
                set(t) {
                    self.settings.customCrosshairOutline = parseInt(t);
                }
            },
            customCrosshairOutlineColor: {
                name: "Outline Color",
                val: "#000000",
                html() {
                    return `<input type='color' id='crosshairOutlineColor' name='color' value='${self.settingsMenu.customCrosshairOutlineColor.val}' oninput='window.utilities.setSetting("customCrosshairOutlineColor", this.value)' style='float:right;margin-top:5px'/>`
                },
                set(t) {
                    self.settings.customCrosshairOutlineColor = t;
                }
            },
        };
        window.windows.push({
            header: "Utilities Lite",
            html: "",
            gen: function () {
                var t = "";
                for (var key in window.utilities.settingsMenu) {
                    window.utilities.settingsMenu[key].pre && (t += window.utilities.settingsMenu[key].pre),
                    t += "<div class=\'settName\'>" + window.utilities.settingsMenu[key].name + " " + window.utilities.settingsMenu[key].html() + "</div>";
                }
                return t;
            }
        });
        this.setupSettings();
    }

    setupSettings() {
        for (const key in this.settingsMenu) {
            if (this.settingsMenu[key].set) {
                const nt = this.getSavedVal(`kro_set_utilities_${key}`);
                this.settingsMenu[key].val = null !== nt ? nt : this.settingsMenu[key].val;
                "false" === this.settingsMenu[key].val && (this.settingsMenu[key].val = !1)
                this.settingsMenu[key].set(this.settingsMenu[key].val, !0)
            }
        }
    }

    keyDown(event) {
        if (this.activeInput()) return;
    }

    chatMessage(t, e, n) {
        const chatList = document.getElementById('chatList');
        for (chatList.innerHTML += n ? `<div class='chatItem'><span class='chatMsg'>${e}</span></div><br/>` : `<div class='chatItem'>${t || "unknown"}: <span class='chatMsg'>${e}</span></div><br/>`; chatList.scrollHeight >= 250;) chatList.removeChild(chatList.childNodes[0])
    }

    pixelTranslate(ctx, x, y) {
        ctx.translate(~~x, ~~y);
    }

    text(txt, font, color, x, y) {
        this.ctx.save();
        this.pixelTranslate(this.ctx, x, y);
        this.ctx.fillStyle = color;
        this.ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
        this.ctx.font = font;
        this.ctx.lineWidth = 1;
        this.ctx.strokeText(txt, 0, 0);
        this.ctx.fillText(txt, 0, 0);
        this.ctx.restore();
    }

    rect(x, y, ox, oy, w, h, color, fill) {
        this.ctx.save();
        this.pixelTranslate(this.ctx, x, y);
        this.ctx.beginPath();
        fill ? this.ctx.fillStyle = color : this.ctx.strokeStyle = color;
        this.ctx.rect(ox, oy, w, h);
        fill ? this.ctx.fill() : this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }

    circle(x, y, r, w, color) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.lineWidth = w;
        this.ctx.strokeStyle = color;
        this.ctx.arc(x, y, r, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.restore();
    }

    drawFPS() {
        if (!this.settings.fpsCounter) return;
        const now = performance.now();
        for (; this.fps.times.length > 0 && this.fps.times[0] <= now - 1e3;) this.fps.times.shift();
        this.fps.times.push(now);
        this.fps.cur = this.fps.times.length;
        this.text(this.fps.cur, `${this.settings.fpsFontSize}px GameFont`, this.fps.cur > 50 ? 'green' : (this.fps.cur < 30 ? 'red' : 'orange'), 20, 8 + this.settings.fpsFontSize);
        this.text("Krunker Utilities", `7px GameFont`, "rgba(255,255,255, 0.3)", this.canvas.width - 100, 15);
    }

    drawCrosshair() {
        if (this.settings.customCrosshair == 0) return;
        crosshair.style.opacity = this.crosshairOpacity(crosshair.style.opacity);

        let thickness = this.settings.customCrosshairThickness;
        let outline = this.settings.customCrosshairOutline;
        let length = this.settings.customCrosshairLength;

        let cx = (this.canvas.width / 2);
        let cy = (this.canvas.height / 2);

        if (this.settings.customCrosshairShape == 0) {
            if (outline > 0) {
                this.rect(cx - length - outline, cy - (thickness / 2) - outline, 0, 0, (length * 2) + (outline * 2), thickness + (outline * 2), this.settings.customCrosshairOutlineColor, true);
                this.rect(cx - (thickness * 0.50) - outline, cy - length - outline, 0, 0, thickness + (outline * 2), (length * 2) + (outline * 2), this.settings.customCrosshairOutlineColor, true);
            }

            this.rect(cx - length, cy - (thickness / 2), 0, 0, (length * 2) , thickness, this.settings.customCrosshairColor, true);
            this.rect(cx - (thickness * 0.50), cy - length, 0, 0, thickness, length * 2, this.settings.customCrosshairColor, true);
        } else {
            if (outline > 0) this.circle(cx, cy, length, thickness + (outline * 2), this.settings.customCrosshairOutlineColor);
            this.circle(cx, cy, length, thickness, this.settings.customCrosshairColor);
        }
    }

    crosshairOpacity(t) {
        return this.settings.customCrosshair == 1 ? 0 : t;
    }

    render() {
        this.ctx.clearRect(0, 0, innerWidth, innerHeight);
        this.drawCrosshair();
        this.drawFPS();
        requestAnimationFrame(this.render.bind(this));
    }

    activeInput() {
        return document.activeElement.tagName == "INPUT";
    }

    setSetting(t, e) {
        if (document.getElementById(`slid_utilities_${t}`)) document.getElementById(`slid_utilities_${t}`).innerHTML = e;
        this.settingsMenu[t].set(e);
        this.settingsMenu[t].val = e;
        this.saveVal(`kro_set_utilities_${t}`, e);
    }

    saveVal(t, e) {
        const r = "undefined" != typeof Storage;
        r && localStorage.setItem(t, e)
    }

    getSavedVal(t) {
        const r = "undefined" != typeof Storage;
        return r ? localStorage.getItem(t) : null;
    }

    onLoad() {
        this.createCanvas();
        this.createMenu();
    }
}
window.addEventListener('load', function() {
    window.utilities = new Utilities();
}, false);