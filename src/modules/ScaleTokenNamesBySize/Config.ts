import MakeConfig from '../MakeConfig'; import Category from '../Category';
import ConfigViews from "../../utils/ConfigViews";

export default MakeConfig(__dirname, {
  id: "scaleTokenNamesBySize",
  name: `Scale Token Names By Size`,
  description: `Scales canvas token names proportionally by their size. Smaller tokens display smaller names while larger ones have large names.`,
  category: Category.canvas,

  mods: [
    {
      includes: "vtt.bundle.js",
      find: `c.fillRect(...this._nameplate_data.position,...this._nameplate_data.size),c.fillStyle="rgb(0,0,0)",c.fillText(this._nameplate_data.name,0,this._nameplate_data.position[1]+p+this._nameplate_data.padding)`,
    
      patch: `window.r20es && window.r20es.prepNameplateBack && window.r20es.prepNameplateBack(this, c), c.fillRect(...this._nameplate_data.position,...this._nameplate_data.size),c.fillStyle="rgb(0,0,0)",
              window.r20es && window.r20es.prepNameplateText && window.r20es.prepNameplateText(this, c), c.fillText(this._nameplate_data.name,0,this._nameplate_data.position[1]+p+this._nameplate_data.padding)`
    }
  ],

  configView: {
    widthThreshold: {
      display: "The unit width of a token. Nameplates will not be scaled when a token has this width.",
      type: ConfigViews.Number
    },

    scaleIfLarger: {
      display: "Scale nameplate if token width is larger than the unit width.",
      type: ConfigViews.Checkbox,
    },

    scaleIfSmaller: {
      display: "Scale nameplate if token is smaller than the unit width.",
      type: ConfigViews.Checkbox,
    }
  },

  config: {
    widthThreshold: 70,
    scaleIfLarger: false,
    scaleIfSmaller: true,
  }
});
