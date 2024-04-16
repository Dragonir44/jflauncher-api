/**
 * @openapi
 * components:
 *  schemas:
 *   getVersionResponse:
 *    type: object
 *    properties:
 *     version:
 *      type: string
 *     changelog:
 *      type: object
 *      properties:
 *       en:
 *        type: string
 *       fr:
 *        type: string
 *     download:
 *      type: string
 *     forgeVersion:
 *      type: string
 *   getVersionsResponse:
 *    type: array
 *    items:
 *     $ref: '#/components/schemas/getVersionResponse'
 *   postVersionRequest:
 *    type: object
 *    required:
 *     - version
 *     - changelog
 *     - download
 *     - forgeVersion
 *    properties:
 *     version:
 *      type: string
 *      default: "1.0.0"
 *     changelog:
 *      type: object
 *      properties:
 *       en:
 *        type: string
 *        default: "Initial release"
 *       fr:
 *        type: string
 *        default: "Première version"
 *     download:
 *      type: string
 *      default: "repo\\release\\1.0.0\\v1.0.0.zip"
 *     forgeVersion:
 *      type: string
 *      default: "1.20.1-42.2.21"
 *   postVersionResponse:
 *    $ref: '#/components/schemas/getVersionResponse'
 *   putVersionRequest:
 *    type: object
 *    properties:
 *     version:
 *      type: string
 *      default: "1.0.0"
 *     changelog:
 *      type: object
 *      properties:
 *       en:
 *        type: string
 *        default: "Initial release"
 *       fr:
 *        type: string
 *        default: "Première version"
 *     download:
 *      type: string
 *      default: "repo\\release\\1.0.0\\v1.0.0.zip"
 *     forgeVersion:
 *      type: string
 *      default: "1.20.1-42.2.21"
 *   putVersionResponse:
 *    $ref: '#/components/schemas/getVersionResponse'
 *   deleteVersionResponse:
 *    type: object
 *    properties:
 *     message:
 *      type: string
 *      default: "Version deleted"
 */