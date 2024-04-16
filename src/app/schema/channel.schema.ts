/**
 * @openapi
 * components:
 *  schemas:
 *   getChannelResponse:
 *    type: object
 *    properties:
 *     name:
 *      type: string
 *     versions:
 *      $ref: '#/components/schemas/getVersionsResponse'
 *   getChannelsResponse:
 *    type: array
 *    items:
 *     $ref: '#/components/schemas/getChannelResponse'
 *   postChannelRequest:
 *    type: object
 *    properties:
 *     name:
 *      type: string
 *      default: "release"
 *   postChannelResponse:
 *    type: object
 *    properties:
 *     name:
 *      type: string
 */

export interface getVersionResponse {
    version: string;
    changelog: string;
    download: string;
    forgeVersion: string;
}

export interface getVersionsResponse extends Array<getVersionResponse> {}

export interface getChannelResponse {
    name: string;
    versions: getVersionsResponse;
}

export interface getChannelsResponse extends Array<getChannelResponse> {}

export interface postChannelRequest {
    name: string;
}

export interface postChannelResponse {
    name: string;
}

export interface postVersionRequest {
    version: string;
    changelog: string;
    download: string;
    forgeVersion: string;
}

export interface postVersionResponse extends getVersionResponse {}

export interface putVersionRequest extends postVersionRequest {}