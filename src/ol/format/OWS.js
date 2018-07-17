/**
 * @module ol/format/OWS
 */
import {inherits} from '../util.js';
import {readHref} from '../format/XLink.js';
import XML from '../format/XML.js';
import {readString} from '../format/xsd.js';
import {makeObjectPropertyPusher, makeObjectPropertySetter, makeStructureNS, pushParseAndPop} from '../xml.js';


/**
 * @const
 * @type {Array.<null|string>}
 */
const NAMESPACE_URIS = [null, 'http://www.opengis.net/ows/1.1'];


/**
 * @const
 * @type {Object.<string, Object.<string, module:ol/xml~Parser>>}
 */
const PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'ServiceIdentification': makeObjectPropertySetter(readServiceIdentification),
    'ServiceProvider': makeObjectPropertySetter(readServiceProvider),
    'OperationsMetadata': makeObjectPropertySetter(readOperationsMetadata)
  });


/**
 * @extends {module:ol/format/XML}
 */
class OWS {
  constructor() {
    XML.call(this);
  }

  /**
   * @inheritDoc
   */
  readFromDocument(doc) {
    for (let n = doc.firstChild; n; n = n.nextSibling) {
      if (n.nodeType == Node.ELEMENT_NODE) {
        return this.readFromNode(n);
      }
    }
    return null;
  }

  /**
   * @inheritDoc
   */
  readFromNode(node) {
    const owsObject = pushParseAndPop({},
      PARSERS, node, []);
    return owsObject ? owsObject : null;
  }
}

inherits(OWS, XML);


/**
 * @const
 * @type {Object.<string, Object.<string, module:ol/xml~Parser>>}
 */
const ADDRESS_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'DeliveryPoint': makeObjectPropertySetter(readString),
    'City': makeObjectPropertySetter(readString),
    'AdministrativeArea': makeObjectPropertySetter(readString),
    'PostalCode': makeObjectPropertySetter(readString),
    'Country': makeObjectPropertySetter(readString),
    'ElectronicMailAddress': makeObjectPropertySetter(readString)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, module:ol/xml~Parser>>}
 */
const ALLOWED_VALUES_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'Value': makeObjectPropertyPusher(readValue)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, module:ol/xml~Parser>>}
 */
const CONSTRAINT_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'AllowedValues': makeObjectPropertySetter(readAllowedValues)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, module:ol/xml~Parser>>}
 */
const CONTACT_INFO_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'Phone': makeObjectPropertySetter(readPhone),
    'Address': makeObjectPropertySetter(readAddress)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, module:ol/xml~Parser>>}
 */
const DCP_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'HTTP': makeObjectPropertySetter(readHttp)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, module:ol/xml~Parser>>}
 */
const HTTP_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'Get': makeObjectPropertyPusher(readGet),
    'Post': undefined // TODO
  });


/**
 * @const
 * @type {Object.<string, Object.<string, module:ol/xml~Parser>>}
 */
const OPERATION_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'DCP': makeObjectPropertySetter(readDcp)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, module:ol/xml~Parser>>}
 */
const OPERATIONS_METADATA_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'Operation': readOperation
  });


/**
 * @const
 * @type {Object.<string, Object.<string, module:ol/xml~Parser>>}
 */
const PHONE_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'Voice': makeObjectPropertySetter(readString),
    'Facsimile': makeObjectPropertySetter(readString)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, module:ol/xml~Parser>>}
 */
const REQUEST_METHOD_PARSERS = makeStructureNS(
  NAMESPACE_URIS, {
    'Constraint': makeObjectPropertyPusher(readConstraint)
  });


/**
 * @const
 * @type {Object.<string, Object.<string, module:ol/xml~Parser>>}
 */
const SERVICE_CONTACT_PARSERS =
    makeStructureNS(
      NAMESPACE_URIS, {
        'IndividualName': makeObjectPropertySetter(readString),
        'PositionName': makeObjectPropertySetter(readString),
        'ContactInfo': makeObjectPropertySetter(readContactInfo)
      });


/**
 * @const
 * @type {Object.<string, Object.<string, module:ol/xml~Parser>>}
 */
const SERVICE_IDENTIFICATION_PARSERS =
    makeStructureNS(
      NAMESPACE_URIS, {
        'Abstract': makeObjectPropertySetter(readString),
        'AccessConstraints': makeObjectPropertySetter(readString),
        'Fees': makeObjectPropertySetter(readString),
        'Title': makeObjectPropertySetter(readString),
        'ServiceTypeVersion': makeObjectPropertySetter(readString),
        'ServiceType': makeObjectPropertySetter(readString)
      });


/**
 * @const
 * @type {Object.<string, Object.<string, module:ol/xml~Parser>>}
 */
const SERVICE_PROVIDER_PARSERS =
    makeStructureNS(
      NAMESPACE_URIS, {
        'ProviderName': makeObjectPropertySetter(readString),
        'ProviderSite': makeObjectPropertySetter(readHref),
        'ServiceContact': makeObjectPropertySetter(readServiceContact)
      });


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} The address.
 */
function readAddress(node, objectStack) {
  return pushParseAndPop({},
    ADDRESS_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} The values.
 */
function readAllowedValues(node, objectStack) {
  return pushParseAndPop({},
    ALLOWED_VALUES_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} The constraint.
 */
function readConstraint(node, objectStack) {
  const name = node.getAttribute('name');
  if (!name) {
    return undefined;
  }
  return pushParseAndPop({'name': name},
    CONSTRAINT_PARSERS, node,
    objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} The contact info.
 */
function readContactInfo(node, objectStack) {
  return pushParseAndPop({},
    CONTACT_INFO_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} The DCP.
 */
function readDcp(node, objectStack) {
  return pushParseAndPop({},
    DCP_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} The GET object.
 */
function readGet(node, objectStack) {
  const href = readHref(node);
  if (!href) {
    return undefined;
  }
  return pushParseAndPop({'href': href},
    REQUEST_METHOD_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} The HTTP object.
 */
function readHttp(node, objectStack) {
  return pushParseAndPop({}, HTTP_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} The operation.
 */
function readOperation(node, objectStack) {
  const name = node.getAttribute('name');
  const value = pushParseAndPop({},
    OPERATION_PARSERS, node, objectStack);
  if (!value) {
    return undefined;
  }
  const object = /** @type {Object} */
      (objectStack[objectStack.length - 1]);
  object[name] = value;
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} The operations metadata.
 */
function readOperationsMetadata(node, objectStack) {
  return pushParseAndPop({},
    OPERATIONS_METADATA_PARSERS, node,
    objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} The phone.
 */
function readPhone(node, objectStack) {
  return pushParseAndPop({},
    PHONE_PARSERS, node, objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} The service identification.
 */
function readServiceIdentification(node, objectStack) {
  return pushParseAndPop(
    {}, SERVICE_IDENTIFICATION_PARSERS, node,
    objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} The service contact.
 */
function readServiceContact(node, objectStack) {
  return pushParseAndPop(
    {}, SERVICE_CONTACT_PARSERS, node,
    objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {Object|undefined} The service provider.
 */
function readServiceProvider(node, objectStack) {
  return pushParseAndPop(
    {}, SERVICE_PROVIDER_PARSERS, node,
    objectStack);
}


/**
 * @param {Node} node Node.
 * @param {Array.<*>} objectStack Object stack.
 * @return {string|undefined} The value.
 */
function readValue(node, objectStack) {
  return readString(node);
}


export default OWS;
