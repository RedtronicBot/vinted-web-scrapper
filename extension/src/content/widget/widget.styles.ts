export function injectStyles() {
  if (document.getElementById("vr-styles")) return

  const style = document.createElement("style")
  style.id = "vr-styles"
  style.textContent = `
    #vr-widget {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
      z-index: 9999;
      font-family: sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      min-width: 180px;
    }

    #vr-widget-label {
      font-size: 12px;
      color: #888;
      font-weight: 500;
    }

    #vr-widget-btn {
      background: #09b1ba;
      color: white;
      border: none;
      padding: 8px 14px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      width: 100%;
      transition: background 0.2s;
    }

    #vr-widget-btn:hover {
      background: #07959d;
    }

    .vr-checkbox {
      position: absolute;
      top: 8px;
      left: 8px;
      width: 20px;
      height: 20px;
      cursor: pointer;
      z-index: 9999;
      accent-color: #09b1ba;
    }
  `
  document.head.appendChild(style)
}
