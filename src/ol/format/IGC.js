/**
 * @module ol/format/IGC
 */
import {inherits} from '../util.js';
import Feature from '../Feature.js';
import {transformWithOptions} from '../format/Feature.js';
import TextFeature from '../format/TextFeature.js';
import GeometryLayout from '../geom/GeometryLayout.js';
import LineString from '../geom/LineString.js';
import {get as getProjection} from '../proj.js';

/**
 * IGC altitude/z. One of 'barometric', 'gps', 'none'.
 * @enum {string}
 */
const IGCZ = {
  BAROMETRIC: 'barometric',
  GPS: 'gps',
  NONE: 'none'
};

/**
 * @const
 * @type {RegExp}
 */
const B_RECORD_RE =
    /^B(\d{2})(\d{2})(\d{2})(\d{2})(\d{5})([NS])(\d{3})(\d{5})([EW])([AV])(\d{5})(\d{5})/;


/**
 * @const
 * @type {RegExp}
 */
const H_RECORD_RE = /^H.([A-Z]{3}).*?:(.*)/;


/**
 * @const
 * @type {RegExp}
 */
const HFDTE_RECORD_RE = /^HFDTE(\d{2})(\d{2})(\d{2})/;


/**
 * A regular expression matching the newline characters `\r\n`, `\r` and `\n`.
 *
 * @const
 * @type {RegExp}
 */
const NEWLINE_RE = /\r\n|\r|\n/;


/**
 * @typedef {Object} Options
 * @property {IGCZ|string} [altitudeMode='none'] Altitude mode. Possible
 * values are `'barometric'`, `'gps'`, and `'none'`.
 */


/**
 * @classdesc
 * Feature format for `*.igc` flight recording files.
 *
 * @extends {module:ol/format/TextFeature}
 * @api
 */
class IGC {

  /**
   * @param {module:ol/format/IGC~Options=} opt_options Options.
   */
  constructor(opt_options) {

    const options = opt_options ? opt_options : {};

    TextFeature.call(this);

    /**
     * @inheritDoc
     */
    this.dataProjection = getProjection('EPSG:4326');

    /**
     * @private
     * @type {IGCZ}
     */
    this.altitudeMode_ = options.altitudeMode ? options.altitudeMode : IGCZ.NONE;
  }

  /**
   * @inheritDoc
   */
  readFeatureFromText(text, opt_options) {
    const altitudeMode = this.altitudeMode_;
    const lines = text.split(NEWLINE_RE);
    /** @type {Object.<string, string>} */
    const properties = {};
    const flatCoordinates = [];
    let year = 2000;
    let month = 0;
    let day = 1;
    let lastDateTime = -1;
    let i, ii;
    for (i = 0, ii = lines.length; i < ii; ++i) {
      const line = lines[i];
      let m;
      if (line.charAt(0) == 'B') {
        m = B_RECORD_RE.exec(line);
        if (m) {
          const hour = parseInt(m[1], 10);
          const minute = parseInt(m[2], 10);
          const second = parseInt(m[3], 10);
          let y = parseInt(m[4], 10) + parseInt(m[5], 10) / 60000;
          if (m[6] == 'S') {
            y = -y;
          }
          let x = parseInt(m[7], 10) + parseInt(m[8], 10) / 60000;
          if (m[9] == 'W') {
            x = -x;
          }
          flatCoordinates.push(x, y);
          if (altitudeMode != IGCZ.NONE) {
            let z;
            if (altitudeMode == IGCZ.GPS) {
              z = parseInt(m[11], 10);
            } else if (altitudeMode == IGCZ.BAROMETRIC) {
              z = parseInt(m[12], 10);
            } else {
              z = 0;
            }
            flatCoordinates.push(z);
          }
          let dateTime = Date.UTC(year, month, day, hour, minute, second);
          // Detect UTC midnight wrap around.
          if (dateTime < lastDateTime) {
            dateTime = Date.UTC(year, month, day + 1, hour, minute, second);
          }
          flatCoordinates.push(dateTime / 1000);
          lastDateTime = dateTime;
        }
      } else if (line.charAt(0) == 'H') {
        m = HFDTE_RECORD_RE.exec(line);
        if (m) {
          day = parseInt(m[1], 10);
          month = parseInt(m[2], 10) - 1;
          year = 2000 + parseInt(m[3], 10);
        } else {
          m = H_RECORD_RE.exec(line);
          if (m) {
            properties[m[1]] = m[2].trim();
          }
        }
      }
    }
    if (flatCoordinates.length === 0) {
      return null;
    }
    const layout = altitudeMode == IGCZ.NONE ? GeometryLayout.XYM : GeometryLayout.XYZM;
    const lineString = new LineString(flatCoordinates, layout);
    const feature = new Feature(transformWithOptions(lineString, false, opt_options));
    feature.setProperties(properties);
    return feature;
  }

  /**
   * @inheritDoc
   */
  readFeaturesFromText(text, opt_options) {
    const feature = this.readFeatureFromText(text, opt_options);
    if (feature) {
      return [feature];
    } else {
      return [];
    }
  }

  /**
   * Not implemented.
   * @inheritDoc
   */
  writeFeatureText(feature, opt_options) {}

  /**
   * Not implemented.
   * @inheritDoc
   */
  writeFeaturesText(features, opt_options) {}

  /**
   * Not implemented.
   * @inheritDoc
   */
  writeGeometryText(geometry, opt_options) {}

  /**
   * Not implemented.
   * @inheritDoc
   */
  readGeometryFromText(text, opt_options) {}
}

inherits(IGC, TextFeature);


/**
 * Read the feature from the IGC source.
 *
 * @function
 * @param {Document|Node|Object|string} source Source.
 * @param {module:ol/format/Feature~ReadOptions=} opt_options Read options.
 * @return {module:ol/Feature} Feature.
 * @api
 */
IGC.prototype.readFeature;


/**
 * Read the feature from the source. As IGC sources contain a single
 * feature, this will return the feature in an array.
 *
 * @function
 * @param {Document|Node|Object|string} source Source.
 * @param {module:ol/format/Feature~ReadOptions=} opt_options Read options.
 * @return {Array.<module:ol/Feature>} Features.
 * @api
 */
IGC.prototype.readFeatures;


/**
 * Read the projection from the IGC source.
 *
 * @function
 * @param {Document|Node|Object|string} source Source.
 * @return {module:ol/proj/Projection} Projection.
 * @api
 */
IGC.prototype.readProjection;


export default IGC;
