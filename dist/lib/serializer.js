"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const utils = require("./util/utils");
const moment_1 = require("moment");
const isBuffer = require("is-buffer");
const isStream = require("is-stream");
class Serializer {
    constructor(mappers) {
        this.modelMappers = mappers;
    }
    validateConstraints(mapper, value, objectName) {
        if (mapper.constraints && (value !== null || value !== undefined)) {
            Object.keys(mapper.constraints).forEach((constraintType) => {
                if (constraintType.match(/^ExclusiveMaximum$/ig) !== null) {
                    if (value >= mapper.constraints.ExclusiveMaximum) {
                        throw new Error(`"${objectName}" with value "${value}" should satify the constraint "ExclusiveMaximum": ${mapper.constraints.ExclusiveMaximum}.`);
                    }
                }
                else if (constraintType.match(/^ExclusiveMinimum$/ig) !== null) {
                    if (value <= mapper.constraints.ExclusiveMinimum) {
                        throw new Error(`${objectName} " with value "${value} " should satify the constraint "ExclusiveMinimum": ${mapper.constraints.ExclusiveMinimum}.`);
                    }
                }
                else if (constraintType.match(/^InclusiveMaximum$/ig) !== null) {
                    if (value > mapper.constraints.InclusiveMaximum) {
                        throw new Error(`${objectName}" with value "${value}" should satify the constraint "InclusiveMaximum": ${mapper.constraints.InclusiveMaximum}.`);
                    }
                }
                else if (constraintType.match(/^InclusiveMinimum$/ig) !== null) {
                    if (value < mapper.constraints.InclusiveMinimum) {
                        throw new Error(`${objectName}" with value "${value}" should satify the constraint "InclusiveMinimum": ${mapper.constraints.InclusiveMinimum}.`);
                    }
                }
                else if (constraintType.match(/^MaxItems$/ig) !== null) {
                    if (value.length > mapper.constraints.MaxItems) {
                        throw new Error(`${objectName}" with value "${value}" should satify the constraint "MaxItems": ${mapper.constraints.MaxItems}.`);
                    }
                }
                else if (constraintType.match(/^MaxLength$/ig) !== null) {
                    if (value.length > mapper.constraints.MaxLength) {
                        throw new Error(`${objectName}" with value "${value}" should satify the constraint "MaxLength": ${mapper.constraints.MaxLength}.`);
                    }
                }
                else if (constraintType.match(/^MinItems$/ig) !== null) {
                    if (value.length < mapper.constraints.MinItems) {
                        throw new Error(`${objectName}" with value "${value}" should satify the constraint "MinItems": ${mapper.constraints.MinItems}.`);
                    }
                }
                else if (constraintType.match(/^MinLength$/ig) !== null) {
                    if (value.length < mapper.constraints.MinLength) {
                        throw new Error(`${objectName}" with value "${value}" should satify the constraint "MinLength": ${mapper.constraints.MinLength}.`);
                    }
                }
                else if (constraintType.match(/^MultipleOf$/ig) !== null) {
                    if (value.length % mapper.constraints.MultipleOf !== 0) {
                        throw new Error(`${objectName}" with value "${value}" should satify the constraint "MultipleOf": ${mapper.constraints.MultipleOf}.`);
                    }
                }
                else if (constraintType.match(/^Pattern$/ig) !== null) {
                    if (value.match(mapper.constraints.Pattern.split("/").join("\/")) === null) {
                        throw new Error(`${objectName}" with value "${value}" should satify the constraint "Pattern": ${mapper.constraints.Pattern}.`);
                    }
                }
                else if (constraintType.match(/^UniqueItems/ig) !== null) {
                    if (mapper.constraints.UniqueItems) {
                        if (value.length !== value.filter((item, i, ar) => { {
                            return ar.indexOf(item) === i;
                        } }).length) {
                            throw new Error(`${objectName}" with value "${value}" should satify the constraint "UniqueItems": ${mapper.constraints.UniqueItems}`);
                        }
                    }
                }
            });
        }
    }
    trimEnd(str, ch) {
        let len = str.length;
        while ((len - 1) >= 0 && str[len - 1] === ch) {
            --len;
        }
        return str.substr(0, len);
    }
    bufferToBase64Url(buffer) {
        if (!buffer) {
            return undefined;
        }
        if (!isBuffer(buffer)) {
            throw new Error(`Please provide an input of type Buffer for converting to Base64Url.`);
        }
        // Buffer to Base64.
        const str = buffer.toString("base64");
        // Base64 to Base64Url.
        return this.trimEnd(str, "=").replace(/\+/g, "-").replace(/\//g, "_");
    }
    base64UrlToBuffer(str) {
        if (!str) {
            return undefined;
        }
        if (str && typeof str.valueOf() !== "string") {
            throw new Error("Please provide an input of type string for converting to Buffer");
        }
        // Base64Url to Base64.
        str = str.replace(/\-/g, "+").replace(/\_/g, "/");
        // Base64 to Buffer.
        return Buffer.from(str, "base64");
    }
    splitSerializeName(prop) {
        const classes = [];
        let partialclass = "";
        const subwords = prop.split(".");
        subwords.forEach((item) => {
            if (item.charAt(item.length - 1) === "\\") {
                partialclass += item.substr(0, item.length - 1) + ".";
            }
            else {
                partialclass += item;
                classes.push(partialclass);
                partialclass = "";
            }
        });
        return classes;
    }
    dateToUnixTime(d) {
        if (!d) {
            return undefined;
        }
        if (typeof d.valueOf() === "string") {
            d = new Date(d);
        }
        return Math.floor(d.getTime() / 1000);
    }
    unixTimeToDate(n) {
        if (!n) {
            return undefined;
        }
        return new Date(n * 1000);
    }
    serializeBasicTypes(typeName, objectName, value) {
        if (value !== null && value !== undefined) {
            if (typeName.match(/^Number$/ig) !== null) {
                if (typeof value !== "number") {
                    throw new Error(`${objectName} with value ${value} must be of type number.`);
                }
            }
            else if (typeName.match(/^String$/ig) !== null) {
                if (typeof value.valueOf() !== "string") {
                    throw new Error(`${objectName} with value "${value}" must be of type string.`);
                }
            }
            else if (typeName.match(/^Uuid$/ig) !== null) {
                if (!(typeof value.valueOf() === "string" && utils.isValidUuid(value))) {
                    throw new Error(`${objectName} with value "${value}" must be of type string and a valid uuid.`);
                }
            }
            else if (typeName.match(/^Boolean$/ig) !== null) {
                if (typeof value !== "boolean") {
                    throw new Error(`${objectName} with value ${value} must be of type boolean.`);
                }
            }
            else if (typeName.match(/^Object$/ig) !== null) {
                if (typeof value !== "object") {
                    throw new Error(`${objectName} must be of type object.`);
                }
            }
            else if (typeName.match(/^Stream$/ig) !== null) {
                if (!isStream(value)) {
                    throw new Error(`${objectName} must be of type stream.`);
                }
            }
        }
        return value;
    }
    serializeEnumType(objectName, allowedValues, value) {
        if (!allowedValues) {
            throw new Error(`Please provide a set of allowedValues to validate ${objectName} as an Enum Type.`);
        }
        const isPresent = allowedValues.some((item) => {
            if (typeof item.valueOf() === "string") {
                return item.toLowerCase() === value.toLowerCase();
            }
            return item === value;
        });
        if (!isPresent) {
            throw new Error(`${value} is not a valid value for ${objectName}. The valid values are: ${JSON.stringify(allowedValues)}.`);
        }
        return value;
    }
    serializeBufferType(objectName, value) {
        if (value !== null && value !== undefined) {
            if (!isBuffer(value)) {
                throw new Error(`${objectName} must be of type Buffer.`);
            }
            value = value.toString("base64");
        }
        return value;
    }
    serializeBase64UrlType(objectName, value) {
        if (value !== null && value !== undefined) {
            if (!isBuffer(value)) {
                throw new Error(`${objectName} must be of type Buffer.`);
            }
            value = this.bufferToBase64Url(value);
        }
        return value;
    }
    serializeDateTypes(typeName, value, objectName) {
        if (value !== null && value !== undefined) {
            if (typeName.match(/^Date$/ig) !== null) {
                if (!(value instanceof Date ||
                    (typeof value.valueOf() === "string" && !isNaN(Date.parse(value))))) {
                    throw new Error(`${objectName} must be an instanceof Date or a string in ISO8601 format.`);
                }
                value = (value instanceof Date) ? value.toISOString().substring(0, 10) : new Date(value).toISOString().substring(0, 10);
            }
            else if (typeName.match(/^DateTime$/ig) !== null) {
                if (!(value instanceof Date ||
                    (typeof value.valueOf() === "string" && !isNaN(Date.parse(value))))) {
                    throw new Error(`${objectName} must be an instanceof Date or a string in ISO8601 format.`);
                }
                value = (value instanceof Date) ? value.toISOString() : new Date(value).toISOString();
            }
            else if (typeName.match(/^DateTimeRfc1123$/ig) !== null) {
                if (!(value instanceof Date ||
                    (typeof value.valueOf() === "string" && !isNaN(Date.parse(value))))) {
                    throw new Error(`${objectName} must be an instanceof Date or a string in RFC-1123 format.`);
                }
                value = (value instanceof Date) ? value.toUTCString() : new Date(value).toUTCString();
            }
            else if (typeName.match(/^UnixTime$/ig) !== null) {
                if (!(value instanceof Date ||
                    (typeof value.valueOf() === "string" && !isNaN(Date.parse(value))))) {
                    throw new Error(`${objectName} must be an instanceof Date or a string in RFC-1123/ISO8601 format ` +
                        `for it to be serialized in UnixTime/Epoch format.`);
                }
                value = this.dateToUnixTime(value);
            }
            else if (typeName.match(/^TimeSpan$/ig) !== null) {
                if (!moment_1.isDuration(value)) {
                    throw new Error(`${objectName} must be a TimeSpan/Duration.`);
                }
                value = value.toISOString();
            }
        }
        return value;
    }
    serializeSequenceType(mapper, object, objectName) {
        if (!Array.isArray(object)) {
            throw new Error(`${objectName} must be of type Array.`);
        }
        if (!mapper.type.element || typeof mapper.type.element !== "object") {
            throw new Error(`element" metadata for an Array must be defined in the ` +
                `mapper and it must of type "object" in ${objectName}.`);
        }
        const tempArray = [];
        for (let i = 0; i < object.length; i++) {
            tempArray[i] = this.serialize(mapper.type.element, object[i], objectName);
        }
        return tempArray;
    }
    serializeDictionaryType(mapper, object, objectName) {
        if (typeof object !== "object") {
            throw new Error(`${objectName} must be of type object.`);
        }
        if (!mapper.type.value || typeof mapper.type.value !== "object") {
            throw new Error(`"value" metadata for a Dictionary must be defined in the ` +
                `mapper and it must of type "object" in ${objectName}.`);
        }
        const tempDictionary = {};
        for (const key in object) {
            if (object.hasOwnProperty(key)) {
                tempDictionary[key] = this.serialize(mapper.type.value, object[key], objectName);
            }
        }
        return tempDictionary;
    }
    serializeCompositeType(mapper, object, objectName) {
        // check for polymorphic discriminator
        if (mapper.type.polymorphicDiscriminator) {
            mapper = this.getPolymorphicMapper(mapper, object, objectName, "serialize");
        }
        const payload = {};
        let modelMapper = {
            required: false,
            serializedName: "serializedName",
            type: {
                name: "Composite",
                className: "className",
                modelProperties: {}
            }
        };
        if (object !== null && object !== undefined) {
            let modelProps = mapper.type.modelProperties;
            if (!modelProps) {
                if (!mapper.type.className) {
                    throw new Error(`Class name for model "${objectName}" is not provided in the mapper "${JSON.stringify(mapper, undefined, 2)}".`);
                }
                // get the mapper if modelProperties of the CompositeType is not present and
                // then get the modelProperties from it.
                modelMapper = this.modelMappers[mapper.type.className];
                if (!modelMapper) {
                    throw new Error(`mapper() cannot be null or undefined for model "${mapper.type.className}".`);
                }
                modelProps = modelMapper.type.modelProperties;
                if (!modelProps) {
                    throw new Error(`modelProperties cannot be null or undefined in the ` +
                        `mapper "${JSON.stringify(modelMapper)}" of type "${mapper.type.className}" for object "${objectName}".`);
                }
            }
            for (const key in modelProps) {
                if (modelProps.hasOwnProperty(key)) {
                    const paths = this.splitSerializeName(modelProps[key].serializedName);
                    const propName = paths.pop();
                    let parentObject = payload;
                    paths.forEach((pathName) => {
                        const childObject = parentObject[pathName];
                        if ((childObject === null || childObject === undefined) && (object[key] !== null && object[key] !== undefined)) {
                            parentObject[pathName] = {};
                        }
                        parentObject = parentObject[pathName];
                    });
                    // make sure required properties of the CompositeType are present
                    if (modelProps[key].required && !modelProps[key].isConstant) {
                        if (object[key] === null || object[key] === undefined) {
                            throw new Error(`${key}" cannot be null or undefined in "${objectName}".`);
                        }
                    }
                    // make sure that readOnly properties are not sent on the wire
                    if (modelProps[key].readOnly) {
                        continue;
                    }
                    // serialize the property if it is present in the provided object instance
                    if (((parentObject !== null && parentObject !== undefined) && (modelProps[key].defaultValue !== null && modelProps[key].defaultValue !== undefined)) ||
                        (object[key] !== null && object[key] !== undefined)) {
                        let propertyObjectName = objectName;
                        if (modelProps[key].serializedName !== "")
                            propertyObjectName = objectName + "." + modelProps[key].serializedName;
                        const propertyMapper = modelProps[key];
                        const serializedValue = this.serialize(propertyMapper, object[key], propertyObjectName);
                        if (propName !== null && propName !== undefined)
                            parentObject[propName] = serializedValue;
                    }
                }
            }
            return payload;
        }
        return object;
    }
    /**
     * Serialize the given object based on its metadata defined in the mapper
     *
     * @param {Mapper} mapper The mapper which defines the metadata of the serializable object
     *
     * @param {object|string|Array|number|boolean|Date|stream} object A valid Javascript object to be serialized
     *
     * @param {string} objectName Name of the serialized object
     *
     * @returns {object|string|Array|number|boolean|Date|stream} A valid serialized Javascript object
     */
    serialize(mapper, object, objectName) {
        let payload = {};
        const mapperType = mapper.type.name;
        if (!objectName)
            objectName = mapper.serializedName;
        if (mapperType.match(/^Sequence$/ig) !== null)
            payload = [];
        // Throw if required and object is null or undefined
        if (mapper.required && (object === null || object === undefined) && !mapper.isConstant) {
            throw new Error(`${objectName} cannot be null or undefined.`);
        }
        // Set Defaults
        if ((mapper.defaultValue !== null && mapper.defaultValue !== undefined) &&
            (object === null || object === undefined)) {
            object = mapper.defaultValue;
        }
        if (mapper.isConstant)
            object = mapper.defaultValue;
        // Validate Constraints if any
        this.validateConstraints(mapper, object, objectName);
        if (mapperType.match(/^(Number|String|Boolean|Object|Stream|Uuid)$/ig) !== null) {
            payload = this.serializeBasicTypes(mapperType, objectName, object);
        }
        else if (mapperType.match(/^Enum$/ig) !== null) {
            const enumMapper = mapper;
            payload = this.serializeEnumType(objectName, enumMapper.type.allowedValues, object);
        }
        else if (mapperType.match(/^(Date|DateTime|TimeSpan|DateTimeRfc1123|UnixTime)$/ig) !== null) {
            payload = this.serializeDateTypes(mapperType, object, objectName);
        }
        else if (mapperType.match(/^ByteArray$/ig) !== null) {
            payload = this.serializeBufferType(objectName, object);
        }
        else if (mapperType.match(/^Base64Url$/ig) !== null) {
            payload = this.serializeBase64UrlType(objectName, object);
        }
        else if (mapperType.match(/^Sequence$/ig) !== null) {
            payload = this.serializeSequenceType(mapper, object, objectName);
        }
        else if (mapperType.match(/^Dictionary$/ig) !== null) {
            payload = this.serializeDictionaryType(mapper, object, objectName);
        }
        else if (mapperType.match(/^Composite$/ig) !== null) {
            payload = this.serializeCompositeType(mapper, object, objectName);
        }
        return payload;
    }
    deserializeCompositeType(mapper, responseBody, objectName) {
        /*jshint validthis: true */
        // check for polymorphic discriminator
        if (mapper.type.polymorphicDiscriminator) {
            mapper = this.getPolymorphicMapper(mapper, responseBody, objectName, "deserialize");
        }
        let instance = {};
        let modelMapper = {
            required: false,
            serializedName: "serializedName",
            type: {
                name: "Composite"
            }
        };
        if (responseBody !== null && responseBody !== undefined) {
            let modelProps = mapper.type.modelProperties;
            if (!modelProps) {
                if (!mapper.type.className) {
                    throw new Error(`Class name for model "${objectName}" is not provided in the mapper "${JSON.stringify(mapper)}"`);
                }
                // get the mapper if modelProperties of the CompositeType is not present and
                // then get the modelProperties from it.
                modelMapper = this.modelMappers[mapper.type.className];
                if (!modelMapper) {
                    throw new Error(`mapper() cannot be null or undefined for model "${mapper.type.className}"`);
                }
                modelProps = modelMapper.type.modelProperties;
                if (!modelProps) {
                    throw new Error(`modelProperties cannot be null or undefined in the ` +
                        `mapper "${JSON.stringify(modelMapper)}" of type "${mapper.type.className}" for responseBody "${objectName}".`);
                }
            }
            for (const key in modelProps) {
                if (modelProps.hasOwnProperty(key)) {
                    const jpath = ["responseBody"];
                    const paths = this.splitSerializeName(modelProps[key].serializedName);
                    paths.forEach((item) => {
                        jpath.push(`["${item}"]`);
                    });
                    // deserialize the property if it is present in the provided responseBody instance
                    let propertyInstance;
                    try {
                        /*jslint evil: true */
                        propertyInstance = eval(jpath.join(""));
                    }
                    catch (err) {
                        continue;
                    }
                    let propertyObjectName = objectName;
                    if (modelProps[key].serializedName !== "")
                        propertyObjectName = objectName + "." + modelProps[key].serializedName;
                    const propertyMapper = modelProps[key];
                    let serializedValue;
                    // paging
                    if (Array.isArray(responseBody[key]) && modelProps[key].serializedName === "") {
                        propertyInstance = responseBody[key];
                        instance = this.deserialize(propertyMapper, propertyInstance, propertyObjectName);
                    }
                    else if (propertyInstance !== null && propertyInstance !== undefined) {
                        serializedValue = this.deserialize(propertyMapper, propertyInstance, propertyObjectName);
                        instance[key] = serializedValue;
                    }
                }
            }
            return instance;
        }
        return responseBody;
    }
    deserializeDictionaryType(mapper, responseBody, objectName) {
        /*jshint validthis: true */
        if (!mapper.type.value || typeof mapper.type.value !== "object") {
            throw new Error(`"value" metadata for a Dictionary must be defined in the ` +
                `mapper and it must of type "object" in ${objectName}`);
        }
        if (responseBody) {
            const tempDictionary = {};
            for (const key in responseBody) {
                if (responseBody.hasOwnProperty(key)) {
                    tempDictionary[key] = this.deserialize(mapper.type.value, responseBody[key], objectName);
                }
            }
            return tempDictionary;
        }
        return responseBody;
    }
    deserializeSequenceType(mapper, responseBody, objectName) {
        /*jshint validthis: true */
        if (!mapper.type.element || typeof mapper.type.element !== "object") {
            throw new Error(`element" metadata for an Array must be defined in the ` +
                `mapper and it must of type "object" in ${objectName}`);
        }
        if (responseBody) {
            const tempArray = [];
            for (let i = 0; i < responseBody.length; i++) {
                tempArray[i] = this.deserialize(mapper.type.element, responseBody[i], objectName);
            }
            return tempArray;
        }
        return responseBody;
    }
    /**
     * Deserialize the given object based on its metadata defined in the mapper
     *
     * @param {object} mapper The mapper which defines the metadata of the serializable object
     *
     * @param {object|string|Array|number|boolean|Date|stream} responseBody A valid Javascript entity to be deserialized
     *
     * @param {string} objectName Name of the deserialized object
     *
     * @returns {object|string|Array|number|boolean|Date|stream} A valid deserialized Javascript object
     */
    deserialize(mapper, responseBody, objectName) {
        if (responseBody === null || responseBody === undefined)
            return responseBody;
        let payload;
        const mapperType = mapper.type.name;
        if (!objectName)
            objectName = mapper.serializedName;
        if (mapperType.match(/^Sequence$/ig) !== null)
            payload = [];
        if (mapperType.match(/^(Number|String|Boolean|Enum|Object|Stream|Uuid)$/ig) !== null) {
            payload = responseBody;
        }
        else if (mapperType.match(/^(Date|DateTime|DateTimeRfc1123)$/ig) !== null) {
            payload = new Date(responseBody);
        }
        else if (mapperType.match(/^TimeSpan$/ig) !== null) {
            payload = moment_1.duration(responseBody);
        }
        else if (mapperType.match(/^UnixTime$/ig) !== null) {
            payload = this.unixTimeToDate(responseBody);
        }
        else if (mapperType.match(/^ByteArray$/ig) !== null) {
            payload = Buffer.from(responseBody, "base64");
        }
        else if (mapperType.match(/^Base64Url$/ig) !== null) {
            payload = this.base64UrlToBuffer(responseBody);
        }
        else if (mapperType.match(/^Sequence$/ig) !== null) {
            payload = this.deserializeSequenceType(mapper, responseBody, objectName);
        }
        else if (mapperType.match(/^Dictionary$/ig) !== null) {
            payload = this.deserializeDictionaryType(mapper, responseBody, objectName);
        }
        else if (mapperType.match(/^Composite$/ig) !== null) {
            payload = this.deserializeCompositeType(mapper, responseBody, objectName);
        }
        if (mapper.isConstant)
            payload = mapper.defaultValue;
        return payload;
    }
    getPolymorphicMapper(mapper, object, objectName, mode) {
        // check for polymorphic discriminator
        // Until version 1.15.1, "polymorphicDiscriminator" in the mapper was a string. This method was not effective when the
        // polymorphicDiscriminator property had a dot in it"s name. So we have comeup with a desgin where polymorphicDiscriminator
        // will be an object that contains the clientName (normalized property name, ex: "odatatype") and
        // the serializedName (ex: "odata.type") (We do not escape the dots with double backslash in this case as it is not required)
        // Thus when serializing, the user will give us an object which will contain the normalizedProperty hence we will lookup
        // the clientName of the polmorphicDiscriminator in the mapper and during deserialization from the responseBody we will
        // lookup the serializedName of the polmorphicDiscriminator in the mapper. This will help us in selecting the correct mapper
        // for the model that needs to be serializes or deserialized.
        // We need this routing for backwards compatibility. This will absorb the breaking change in the mapper and allow new versions
        // of the runtime to work seamlessly with older version (>= 0.17.0-Nightly20161008) of Autorest generated node.js clients.
        if (mapper.type.polymorphicDiscriminator) {
            if (typeof mapper.type.polymorphicDiscriminator.valueOf() === "string") {
                return this.getPolymorphicMapperStringVersion(mapper, object, objectName);
            }
            else if (mapper.type.polymorphicDiscriminator instanceof Object) {
                return this.getPolymorphicMapperObjectVersion(mapper, object, objectName, mode);
            }
            else {
                throw new Error(`The polymorphicDiscriminator for "${objectName}" is neither a string nor an object.`);
            }
        }
        return mapper;
    }
    // processes new version of the polymorphicDiscriminator in the mapper.
    getPolymorphicMapperObjectVersion(mapper, object, objectName, mode) {
        // check for polymorphic discriminator
        let polymorphicPropertyName = "";
        if (mode === "serialize") {
            polymorphicPropertyName = "clientName";
        }
        else if (mode === "deserialize") {
            polymorphicPropertyName = "serializedName";
        }
        else {
            throw new Error(`The given mode "${mode}" for getting the polymorphic mapper for "${objectName}" is inavlid.`);
        }
        const discriminatorAsObject = mapper.type.polymorphicDiscriminator;
        if (discriminatorAsObject &&
            discriminatorAsObject[polymorphicPropertyName] !== null &&
            discriminatorAsObject[polymorphicPropertyName] !== undefined) {
            if (object === null || object === undefined) {
                throw new Error(`${objectName}" cannot be null or undefined. ` +
                    `"${discriminatorAsObject[polymorphicPropertyName]}" is the ` +
                    `polmorphicDiscriminator and is a required property.`);
            }
            if (object[discriminatorAsObject[polymorphicPropertyName]] === null ||
                object[discriminatorAsObject[polymorphicPropertyName]] === undefined) {
                throw new Error(`No discriminator field "${discriminatorAsObject[polymorphicPropertyName]}" was found in "${objectName}".`);
            }
            let indexDiscriminator = undefined;
            if (object[discriminatorAsObject[polymorphicPropertyName]] === mapper.type.uberParent) {
                indexDiscriminator = object[discriminatorAsObject[polymorphicPropertyName]];
            }
            else {
                indexDiscriminator = mapper.type.uberParent + "." + object[discriminatorAsObject[polymorphicPropertyName]];
            }
            if (!this.modelMappers.discriminators[indexDiscriminator]) {
                throw new Error(`${discriminatorAsObject[polymorphicPropertyName]}": ` +
                    `"${object[discriminatorAsObject[polymorphicPropertyName]]}" in "${objectName}" is not a valid ` +
                    `discriminator as a corresponding model class for the disciminator "${indexDiscriminator}" ` +
                    `was not found in this.modelMappers.discriminators object.`);
            }
            mapper = this.modelMappers.discriminators[indexDiscriminator];
        }
        return mapper;
    }
    // processes old version of the polymorphicDiscriminator in the mapper.
    getPolymorphicMapperStringVersion(mapper, object, objectName) {
        // check for polymorphic discriminator
        const discriminatorAsString = mapper.type.polymorphicDiscriminator;
        if (discriminatorAsString !== null && discriminatorAsString !== undefined) {
            if (object === null || object === undefined) {
                throw new Error(`${objectName}" cannot be null or undefined. "${discriminatorAsString}" is the ` +
                    `polmorphicDiscriminator and is a required property.`);
            }
            if (object[discriminatorAsString] === null || object[discriminatorAsString] === undefined) {
                throw new Error(`No discriminator field "${discriminatorAsString}" was found in "${objectName}".`);
            }
            let indexDiscriminator = undefined;
            if (object[discriminatorAsString] === mapper.type.uberParent) {
                indexDiscriminator = object[discriminatorAsString];
            }
            else {
                indexDiscriminator = mapper.type.uberParent + "." + object[discriminatorAsString];
            }
            if (!this.modelMappers.discriminators[indexDiscriminator]) {
                throw new Error(`${discriminatorAsString}": ` +
                    `"${object[discriminatorAsString]}"  in "${objectName}" is not a valid ` +
                    `discriminator as a corresponding model class for the disciminator "${indexDiscriminator}" ` +
                    `was not found in this.models.discriminators object.`);
            }
            mapper = this.modelMappers.discriminators[indexDiscriminator];
        }
        return mapper;
    }
}
exports.Serializer = Serializer;
function serializeObject(toSerialize) {
    if (toSerialize === null || toSerialize === undefined)
        return undefined;
    if (isBuffer(toSerialize)) {
        toSerialize = toSerialize.toString("base64");
        return toSerialize;
    }
    else if (toSerialize instanceof Date) {
        return toSerialize.toISOString();
    }
    else if (Array.isArray(toSerialize)) {
        const array = [];
        for (let i = 0; i < toSerialize.length; i++) {
            array.push(serializeObject(toSerialize[i]));
        }
        return array;
    }
    else if (typeof toSerialize === "object") {
        const dictionary = {};
        for (const property in toSerialize) {
            dictionary[property] = serializeObject(toSerialize[property]);
        }
        return dictionary;
    }
    return toSerialize;
}
exports.serializeObject = serializeObject;
exports.MapperType = utils.strEnum([
    "Base64Url",
    "Boolean",
    "ByteArray",
    "Composite",
    "Date",
    "DateTime",
    "DateTimeRfc1123",
    "Dictionary",
    "Enum",
    "Number",
    "Object",
    "Sequence",
    "String",
    "Stream",
    "TimeSpan",
    "UnixTime"
]);
//# sourceMappingURL=serializer.js.map