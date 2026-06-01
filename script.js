const alertScreen = document.getElementById("alertScreen");
const alarm = document.getElementById("alarm");

let alertActive = false;
let worker = null;

function triggerAlarm() {

    if(alertActive) return;

    alertActive = true;

    // Send message to App Inventor to play alarm
    if (window.AppInventor) {
        window.AppInventor.setWebViewString("ALARM_ON");
    } else if (window.Android) {
        window.Android.playAlarm();
    } else {
        // Fallback for web browser - use HTML5 audio
        alarm.loop = true;
        alarm.play().catch(e => console.log("Audio play failed:", e));
        
        // Also show browser notification if page is hidden
        if (document.hidden && Notification.permission === "granted") {
            new Notification("Price Alert!", {
                body: "Target price reached!",
                icon: ""
            });
        }
    }

    alertScreen.style.display = "flex";
}

function stopAlarm() {

    alertActive = false;

    // Send message to App Inventor to stop alarm
    if (window.AppInventor) {
        window.AppInventor.setWebViewString("ALARM_OFF");
    } else if (window.Android) {
        window.Android.stopAlarm();
    } else {
        // Fallback for web browser - stop HTML5 audio
        alarm.pause();
        alarm.currentTime = 0;
    }

    alertScreen.style.display = "none";
}

document.getElementById("alertScreen")
.addEventListener("click", stopAlarm);

document.getElementById("startBtn")
.addEventListener("click", () => {

    // Request notification permission for background alerts
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }

    // Create Web Worker for background monitoring
    const workerCode = `
        let ws = null;
        let alertTriggered = false;

        self.onmessage = function(e) {
            if (e.data === 'start') {
                ws = new WebSocket("wss://ws.derivws.com/websockets/v3?app_id=1089");

                ws.onopen = function() {
                    ws.send(JSON.stringify({ ticks: "CRASH300" }));
                    ws.send(JSON.stringify({ ticks: "BOOM1000" }));
                };

                ws.onmessage = function(msg) {
                    const data = JSON.parse(msg.data);
                    if (!data.tick) return;

                    const symbol = data.tick.symbol;
                    const price = data.tick.quote;

                    // Send price update to main thread
                    self.postMessage({ type: 'price', symbol, price });

                    // Check thresholds if alarm not already triggered
                    if (!alertTriggered) {
                        self.postMessage({ 
                            type: 'check', 
                            symbol, 
                            price 
                        });
                    }
                };

                ws.onerror = function(error) {
                    console.log("WebSocket error:", error);
                };

                ws.onclose = function() {
                    // Reconnect after 5 seconds
                    setTimeout(() => {
                        self.postMessage('start');
                    }, 5000);
                };
            } else if (e.data.type === 'reset') {
                alertTriggered = false;
            } else if (e.data.type === 'stop') {
                if (ws) ws.close();
            }
        };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    worker = new Worker(URL.createObjectURL(blob));

    worker.onmessage = function(e) {
        const message = e.data;

        if (message.type === 'price') {
            // Update UI with current price
            if (message.symbol === "CRASH300") {
                document.getElementById("crashPrice").innerText = message.price;
            } else if (message.symbol === "BOOM1000") {
                document.getElementById("boomPrice").innerText = message.price;
            }
        } else if (message.type === 'check') {
            // Check if price thresholds are met
            const symbol = message.symbol;
            const price = message.price;

            if (symbol === "CRASH300") {
                const upper = parseFloat(document.getElementById("crashUpper").value);
                const lower = parseFloat(document.getElementById("crashLower").value);

                if ((!isNaN(upper) && price >= upper) || (!isNaN(lower) && price <= lower)) {
                    triggerAlarm();
                    worker.postMessage({ type: 'reset' });
                }
            } else if (symbol === "BOOM1000") {
                const upper = parseFloat(document.getElementById("boomUpper").value);
                const lower = parseFloat(document.getElementById("boomLower").value);

                if ((!isNaN(upper) && price >= upper) || (!isNaN(lower) && price <= lower)) {
                    triggerAlarm();
                    worker.postMessage({ type: 'reset' });
                }
            }
        }
    };

    // Start the worker
    worker.postMessage('start');
});