import { Buffer } from "buffer";
import { RigeljsError, RigeljsTypeError, ErrorCodes } from "../errors.js";

let fs, path;
if (typeof process !== "undefined" && process.versions?.node) {
    fs = await import("fs/promises");
    path = await import("path");
};

/**
 * Data that can be resolved to give a Buffer. This can be:
 * * A Buffer
 * * The path to a local file
 * * A URL <warn>When provided a URL, rigel.js will fetch the URL internally in order to create a Buffer.
 * This can pose a security risk when the URL has not been sanitized</warn>
 * @typedef {string|Buffer} BufferResolvable
 */

/**
 * @typedef {Object} ResolvedFile
 * @property {Buffer} data Buffer containing the file data
 * @property {string} [contentType] Content-Type of the file
 * @private
 */

/**
 * Resolves a BufferResolvable to a Buffer.
 * @param {BufferResolvable} resource The buffer resolvable to resolve
 * @returns {Promise<ResolvedFile>}
 * @private
 */
export async function resolveFile(resource) {
    if (Buffer.isBuffer(resource)) return { data: resource };

    if (typeof resource[Symbol.asyncIterator] === "function") {
        const buffers = [];
        for await (const data of resource) buffers.push(Buffer.from(data));
        return { data: Buffer.concat(buffers) };
    };

    if (typeof resource === "string") {
        if (/^https?:\/\//.test(resource)) {
            const res = await fetch(resource);
            return { data: Buffer.from(await res.arrayBuffer()), contentType: res.headers.get("content-type") };
        };

        if (fs && path) {
            const file = path.resolve(resource);
            const stats = await fs.stat(file);
            if (!stats.isFile()) throw new RigeljsError(ErrorCodes.FileNotFound, file);
            return { data: await fs.readFile(file) };
        };
    };

    throw new RigeljsTypeError(ErrorCodes.ReqResourceType);
};

/**
 * Data that resolves to give a Base64 string, typically for image uploading. This can be:
 * * A Buffer
 * * A base64 string
 * @typedef {Buffer|string} Base64Resolvable
 */

/**
 * Resolves a Base64Resolvable to a Base 64 string.
 * @param {Base64Resolvable} data The base 64 resolvable you want to resolve
 * @param {string} [contentType='image/jpg'] The content type of the data
 * @returns {?string}
 * @private
 */
export function resolveBase64(data, contentType = "image/jpg") {
    if (Buffer.isBuffer(data)) return `data:${contentType};base64,${data.toString("base64")}`;
    return data;
};

/**
 * Resolves a Base64Resolvable, a string, or a BufferResolvable to a Base 64 image.
 * @param {BufferResolvable|Base64Resolvable} image The image to be resolved
 * @returns {Promise<?string>}
 * @private
 */
export async function resolveImage(image) {
    if (!image) return null;
    if (typeof image === "string" && image.startsWith("data:")) {
        return image;
    };
    const file = await resolveFile(image);
    return resolveBase64(file.data);
};