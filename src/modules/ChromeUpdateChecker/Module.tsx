import {R20Module} from "../../utils/R20Module";
import {DOM} from "../../utils/DOM";
import {R20} from "../../utils/R20";
import {Config} from "../../utils/Config";

declare namespace build {
    export const R20ES_VERSION: string;
}

class ChromeUpdateChecker extends R20Module.OnAppLoadBase {

    public constructor() {
        super(__dirname);
    }

    public setup() {

      const coroutines = async () => {
        try {
          const request = await fetch("https://justas-d.github.io/roll20-enhancement-suite/latest_chrome_version");
          let text = await request.text();
          text = text.trim();

          if(text != build.R20ES_VERSION) {
            R20.saySystem(`
<h2 style="color: whitesmoke">Update Available!</h2>
<span>VTTES Has an update available. Grab it 
  <a style="color: orange;" href="https://justas-d.github.io/roll20-enhancement-suite/chrome.html">here</a>.
</span>
<br/>
`);
          }
        } catch(err) {
          console.error("VTTES: failed to check for new version", err);
        }
      };

      setTimeout(coroutines, 4000);
    }

    public dispose() {
      super.dispose();
    }
}

if (R20Module.canInstall()) new ChromeUpdateChecker().install();
