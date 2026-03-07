import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'truuth/1.0.0 (api/6.1.3)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Classify submitted ID Document
   *
   * @summary Classify
   * @throws FetchError<400, types.ClassifyResponse400> Validation Error
   * @throws FetchError<500, types.ClassifyResponse500> Internal Server Error
   */
  classify(body: types.ClassifyBodyParam): Promise<FetchResponse<200, types.ClassifyResponse200>> {
    return this.core.fetch('/document-management/v1/classify', 'post', body);
  }

  /**
   * Extract data from submitted ID Document
   *
   * @summary OCR Data Extraction
   * @throws FetchError<400, types.TextractResponse400> Validation Error
   * @throws FetchError<500, types.TextractResponse500> Internal Server Error
   */
  textract(body: types.TextractBodyParam): Promise<FetchResponse<200, types.TextractResponse200>> {
    return this.core.fetch('/document-management/v1/textract', 'post', body);
  }

  /**
   * Verify authenticity of submitted ID document
   *
   * @summary Authenticity Verification V2
   * @throws FetchError<400, types.VerifyResponse400> Validation Error
   * @throws FetchError<500, types.VerifyResponse500> Internal Server Error
   */
  verify(body: types.VerifyBodyParam): Promise<FetchResponse<200, types.VerifyResponse200>> {
    return this.core.fetch('/document-management/v2/authenticity/verify', 'post', body);
  }

  /**
   * Analyzes email submitted with additional attributes
   *
   * @summary Analyze email
   */
  analyze(body: types.AnalyzeBodyParam): Promise<FetchResponse<200, types.AnalyzeResponse200>> {
    return this.core.fetch('/email-fraud/v1/analyze', 'post', body);
  }

  /**
   * This API verifies whether the face on the photo ID document matches with the face on the
   * selfie or not.
   *
   * @summary Perform Face Match
   * @throws FetchError<400, types.LivenessVerifyResponse400> Bad Request
   * @throws FetchError<401, types.LivenessVerifyResponse401> Unauthorized
   * @throws FetchError<500, types.LivenessVerifyResponse500> Internal Server Error
   */
  livenessVerify(body: types.LivenessVerifyBodyParam): Promise<FetchResponse<200, types.LivenessVerifyResponse200>> {
    return this.core.fetch('/face-match/v1/liveness', 'post', body);
  }

  /**
   * This API verifies whether the face on the photo ID document matches with the face on the
   * selfie or not.
   *
   * @summary Verify Face Liveness
   * @throws FetchError<400, types.FaceMatchVerifyResponse400> Bad Request
   * @throws FetchError<401, types.FaceMatchVerifyResponse401> Unauthorized
   * @throws FetchError<500, types.FaceMatchVerifyResponse500> Internal Server Error
   */
  faceMatchVerify(body: types.FaceMatchVerifyBodyParam): Promise<FetchResponse<200, types.FaceMatchVerifyResponse200>> {
    return this.core.fetch('/face-match/v1/verify', 'post', body);
  }

  /**
   * Provisions Repeat Images Instance
   *
   * @summary Provisions Repeat Images Instance
   * @throws FetchError<400, types.RepeatImageprovisionResponse400> bad input parameter
   * @throws FetchError<500, types.RepeatImageprovisionResponse500> internal server error
   */
  repeatImageprovision(body: types.RepeatImageprovisionBodyParam): Promise<FetchResponse<200, types.RepeatImageprovisionResponse200>> {
    return this.core.fetch('/repeat-images/v1/instances/provision', 'post', body);
  }

  /**
   * Deletes Repeat Images Instance
   *
   * @summary Delete Repeat Images Instance
   * @throws FetchError<404, types.RepeatImagedeleteInstanceResponse404> Instance Not Found
   * @throws FetchError<500, types.RepeatImagedeleteInstanceResponse500> Internal Server Error
   */
  repeatImagedeleteInstance(metadata: types.RepeatImagedeleteInstanceMetadataParam): Promise<FetchResponse<200, types.RepeatImagedeleteInstanceResponse200>> {
    return this.core.fetch('/repeat-images/v1/instances/{instanceId}', 'delete', metadata);
  }

  /**
   * List single instance
   *
   * @summary Get Instance by ID
   * @throws FetchError<400, types.RepeatImagelistInstanceResponse400> Bad Input Parameter
   * @throws FetchError<404, types.RepeatImagelistInstanceResponse404> Instance Not Found
   * @throws FetchError<500, types.RepeatImagelistInstanceResponse500> Internal Server Error
   */
  repeatImagelistInstance(metadata: types.RepeatImagelistInstanceMetadataParam): Promise<FetchResponse<200, types.RepeatImagelistInstanceResponse200>> {
    return this.core.fetch('/repeat-images/v1/instances/{instanceId}', 'get', metadata);
  }

  /**
   * Delete data from instances
   *
   * @summary Delete Images by ExternalID
   * @throws FetchError<400, types.RepeatImagedeleteDataQueryResponse400> bad input parameter
   * @throws FetchError<500, types.RepeatImagedeleteDataQueryResponse500> internal server error
   */
  repeatImagedeleteDataQuery(metadata: types.RepeatImagedeleteDataQueryMetadataParam): Promise<FetchResponse<200, types.RepeatImagedeleteDataQueryResponse200>> {
    return this.core.fetch('/repeat-images/v1/instances/{instanceId}/images', 'delete', metadata);
  }

  /**
   * Add data to instances
   *
   * @summary Index Images
   * @throws FetchError<400, types.RepeatImageindexDataResponse400> bad input parameter
   * @throws FetchError<404, types.RepeatImageindexDataResponse404> bad input parameter
   * @throws FetchError<500, types.RepeatImageindexDataResponse500> internal server error
   */
  repeatImageindexData(body: types.RepeatImageindexDataBodyParam, metadata: types.RepeatImageindexDataMetadataParam): Promise<FetchResponse<200, types.RepeatImageindexDataResponse200>> {
    return this.core.fetch('/repeat-images/v1/instances/{instanceId}/images/index', 'post', body, metadata);
  }

  /**
   * Delete data from instances
   *
   * @summary Delete Images by ID
   * @throws FetchError<400, types.RepeatImagedeleteDataPathResponse400> bad input parameter
   * @throws FetchError<500, types.RepeatImagedeleteDataPathResponse500> internal server error
   */
  repeatImagedeleteDataPath(metadata: types.RepeatImagedeleteDataPathMetadataParam): Promise<FetchResponse<200, types.RepeatImagedeleteDataPathResponse200>> {
    return this.core.fetch('/repeat-images/v1/instances/{instanceId}/images/{imageId}', 'delete', metadata);
  }

  /**
   * Submit Repeat Image Matching Request
   *
   * @summary Submit Repeat Image Matching
   * @throws FetchError<400, types.RepeatImagematchResponse400> bad input parameter
   * @throws FetchError<500, types.RepeatImagematchResponse500> internal server error
   */
  repeatImagematch(body: types.RepeatImagematchBodyParam, metadata: types.RepeatImagematchMetadataParam): Promise<FetchResponse<200, types.RepeatImagematchResponse200>> {
    return this.core.fetch('/repeat-images/v1/instances/{instanceId}/matches', 'post', body, metadata);
  }

  /**
   * Get Repeat Image Matching Response
   *
   * @summary Get Repeat Image Matching Response
   * @throws FetchError<400, types.RepeatImagematchGetResponse400> bad input parameter
   * @throws FetchError<500, types.RepeatImagematchGetResponse500> internal server error
   */
  repeatImagematchGet(metadata: types.RepeatImagematchGetMetadataParam): Promise<FetchResponse<200, types.RepeatImagematchGetResponse200>> {
    return this.core.fetch('/repeat-images/v1/instances/{instanceId}/matches/{transactionId}', 'get', metadata);
  }

  /**
   * List Repeat Image Transactions
   *
   * @summary List Repeat Image Transactions
   */
  list(metadata?: types.ListMetadataParam): Promise<FetchResponse<200, types.ListResponse200>> {
    return this.core.fetch('/repeat-images/v1/matches', 'get', metadata);
  }

  /**
   * Get Submitted Image for Transaction
   *
   * @summary Get Submitted Image
   * @throws FetchError<400, types.MatchGetSubmittedImageResponse400> bad input parameter
   * @throws FetchError<500, types.MatchGetSubmittedImageResponse500> internal server error
   */
  matchGetSubmittedImage(metadata: types.MatchGetSubmittedImageMetadataParam): Promise<FetchResponse<200, types.MatchGetSubmittedImageResponse200>> {
    return this.core.fetch('/repeat-images/v1/instances/{instanceId}/matches/{transactionId}/images/submitted', 'get', metadata);
  }

  /**
   * Get Matched Image in Transaction
   *
   * @summary Get Matched Image
   * @throws FetchError<400, types.MatchGetMatchedImageResponse400> bad input parameter
   * @throws FetchError<500, types.MatchGetMatchedImageResponse500> internal server error
   */
  matchGetMatchedImage(metadata: types.MatchGetMatchedImageMetadataParam): Promise<FetchResponse<200, types.MatchGetMatchedImageResponse200>> {
    return this.core.fetch('/repeat-images/v1/instances/{instanceId}/matches/{transactionId}/images/matched/{imageId}', 'get', metadata);
  }

  /**
   * Get the delta image generated between submitted and matched image
   *
   * @summary Get Delta Image
   * @throws FetchError<400, types.MatchGetMatchedDeltaImageResponse400> bad input parameter
   * @throws FetchError<500, types.MatchGetMatchedDeltaImageResponse500> internal server error
   */
  matchGetMatchedDeltaImage(metadata: types.MatchGetMatchedDeltaImageMetadataParam): Promise<FetchResponse<200, types.MatchGetMatchedDeltaImageResponse200>> {
    return this.core.fetch('/repeat-images/v1/instances/{instanceId}/matches/{transactionId}/images/matched/{imageId}/delta', 'get', metadata);
  }

  /**
   * Get negative image generated between submitted and matched image
   *
   * @summary Get Negative Image
   * @throws FetchError<400, types.MatchGetMatchedNegativeImageResponse400> bad input parameter
   * @throws FetchError<500, types.MatchGetMatchedNegativeImageResponse500> internal server error
   */
  matchGetMatchedNegativeImage(metadata: types.MatchGetMatchedNegativeImageMetadataParam): Promise<FetchResponse<200, types.MatchGetMatchedNegativeImageResponse200>> {
    return this.core.fetch('/repeat-images/v1/instances/{instanceId}/matches/{transactionId}/images/matched/{imageId}/negative', 'get', metadata);
  }

  /**
   * Provision an Instance for Repeat Users Service
   *
   * @summary Provision Repeat User Instance
   * @throws FetchError<400, types.ProvisionResponse400> Validation Error
   * @throws FetchError<500, types.ProvisionResponse500> internal server error
   */
  provision(body: types.ProvisionBodyParam): Promise<FetchResponse<200, types.ProvisionResponse200>> {
    return this.core.fetch('/repeat-users/v1/instances/provision', 'post', body);
  }

  /**
   * Deletes repeat user instance based on instanceId
   *
   * @summary Delete Repeat User Instance
   * @throws FetchError<400, types.DeleteInstanceResponse400> Validation Error
   * @throws FetchError<404, types.DeleteInstanceResponse404> Not Found Error
   * @throws FetchError<500, types.DeleteInstanceResponse500> internal server error
   */
  deleteInstance(metadata: types.DeleteInstanceMetadataParam): Promise<FetchResponse<200, types.DeleteInstanceResponse200>> {
    return this.core.fetch('/repeat-users/v1/instances/{instanceId}', 'delete', metadata);
  }

  /**
   * List single instance
   *
   * @summary Get Instance by ID
   * @throws FetchError<400, types.ListInstanceResponse400> bad input parameter
   * @throws FetchError<500, types.ListInstanceResponse500> internal server error
   */
  listInstance(metadata: types.ListInstanceMetadataParam): Promise<FetchResponse<200, types.ListInstanceResponse200>> {
    return this.core.fetch('/repeat-users/v1/instances/{instanceId}', 'get', metadata);
  }

  /**
   * Perform Fraud Check
   *
   * @summary Submit Fraud Check Request
   * @throws FetchError<400, types.FraudCheckResponse400> Validation Error
   * @throws FetchError<404, types.FraudCheckResponse404> Not Found Error
   * @throws FetchError<500, types.FraudCheckResponse500> internal server error
   */
  fraudCheck(body: types.FraudCheckBodyParam, metadata: types.FraudCheckMetadataParam): Promise<FetchResponse<200, types.FraudCheckResponse200>> {
    return this.core.fetch('/repeat-users/v1/instances/{instanceId}/fraud/checks', 'post', body, metadata);
  }

  /**
   * Perform Fraud Check
   *
   * @summary Get Fraud Check Response
   * @throws FetchError<400, types.FraudCheckGetResponse400> Validation Error
   * @throws FetchError<404, types.FraudCheckGetResponse404> Not Found Error
   * @throws FetchError<500, types.FraudCheckGetResponse500> internal server error
   */
  fraudCheckGet(metadata: types.FraudCheckGetMetadataParam): Promise<FetchResponse<200, types.FraudCheckGetResponse200>> {
    return this.core.fetch('/repeat-users/v1/instances/{instanceId}/fraud/checks/{transactionId}', 'get', metadata);
  }

  /**
   * Perform Repeat User Matching
   *
   * @summary Submit Repeat User Matching Request
   * @throws FetchError<400, types.MatchResponse400> Validation Error
   * @throws FetchError<404, types.MatchResponse404> Not Found Error
   * @throws FetchError<500, types.MatchResponse500> internal server error
   */
  match(body: types.MatchBodyParam, metadata: types.MatchMetadataParam): Promise<FetchResponse<200, types.MatchResponse200>> {
    return this.core.fetch('/repeat-users/v1/instances/{instanceId}/matches', 'post', body, metadata);
  }

  /**
   * Perform Repeat User Matching
   *
   * @summary Get Repeat User Matching Response
   * @throws FetchError<400, types.MatchGetResponse400> Validation Error
   * @throws FetchError<404, types.MatchGetResponse404> Not Found Error
   * @throws FetchError<500, types.MatchGetResponse500> internal server error
   */
  matchGet(metadata: types.MatchGetMetadataParam): Promise<FetchResponse<200, types.MatchGetResponse200>> {
    return this.core.fetch('/repeat-users/v1/instances/{instanceId}/matches/{transactionId}', 'get', metadata);
  }

  /**
   * Delete data from instances
   *
   * @summary Delete Records by External ID
   * @throws FetchError<400, types.DeleteDataQueryResponse400> Validation Error
   * @throws FetchError<404, types.DeleteDataQueryResponse404> Not Found Error
   * @throws FetchError<500, types.DeleteDataQueryResponse500> internal server error
   */
  deleteDataQuery(metadata: types.DeleteDataQueryMetadataParam): Promise<FetchResponse<200, types.DeleteDataQueryResponse200>> {
    return this.core.fetch('/repeat-users/v1/instances/{instanceId}/records', 'delete', metadata);
  }

  /**
   * Add data to instances
   *
   * @summary Index Records
   * @throws FetchError<400, types.IndexDataResponse400> Validation Error
   * @throws FetchError<404, types.IndexDataResponse404> Not Found Error
   * @throws FetchError<500, types.IndexDataResponse500> internal server error
   */
  indexData(body: types.IndexDataBodyParam, metadata: types.IndexDataMetadataParam): Promise<FetchResponse<200, types.IndexDataResponse200>> {
    return this.core.fetch('/repeat-users/v1/instances/{instanceId}/records/index', 'post', body, metadata);
  }

  /**
   * Delete data from instances
   *
   * @summary Delete Record by ID
   * @throws FetchError<400, types.DeleteDataPathResponse400> Validation Error
   * @throws FetchError<404, types.DeleteDataPathResponse404> Not Found Error
   * @throws FetchError<500, types.DeleteDataPathResponse500> internal server error
   */
  deleteDataPath(metadata: types.DeleteDataPathMetadataParam): Promise<FetchResponse<200, types.DeleteDataPathResponse200>> {
    return this.core.fetch('/repeat-users/v1/instances/{instanceId}/records/{recordId}', 'delete', metadata);
  }

  /**
   * Provisions Repeat Text Instance
   *
   * @summary Provision Repeat Text Instance
   * @throws FetchError<400, types.RepeatTextProvisionResponse400> bad input parameter
   * @throws FetchError<500, types.RepeatTextProvisionResponse500> internal server error
   */
  repeatTextProvision(body: types.RepeatTextProvisionBodyParam): Promise<FetchResponse<200, types.RepeatTextProvisionResponse200>> {
    return this.core.fetch('/repeat-text/v1/instances/provision', 'post', body);
  }

  /**
   * List single instance
   *
   * @summary Get instance by ID
   * @throws FetchError<400, types.RepeatTextlistInstanceResponse400> Bad Input Parameter
   * @throws FetchError<404, types.RepeatTextlistInstanceResponse404> Instance Not Found
   * @throws FetchError<500, types.RepeatTextlistInstanceResponse500> Internal Server Error
   */
  repeatTextlistInstance(metadata: types.RepeatTextlistInstanceMetadataParam): Promise<FetchResponse<200, types.RepeatTextlistInstanceResponse200>> {
    return this.core.fetch('/repeat-text/v1/instances/{instanceId}', 'get', metadata);
  }

  /**
   * Deletes Repeat Text Instance
   *
   * @summary Delete Instance
   * @throws FetchError<404, types.DeleteInstanceRepeatTextResponse404> Instance Not Found
   * @throws FetchError<500, types.DeleteInstanceRepeatTextResponse500> Internal Server Error
   */
  deleteInstanceRepeatText(metadata: types.DeleteInstanceRepeatTextMetadataParam): Promise<FetchResponse<200, types.DeleteInstanceRepeatTextResponse200>> {
    return this.core.fetch('/repeat-text/v1/instances/{instanceId}', 'delete', metadata);
  }

  /**
   * Add data to instances
   *
   * @summary Index Documents
   * @throws FetchError<400, types.RepeatTextindexDataResponse400> bad input parameter
   * @throws FetchError<404, types.RepeatTextindexDataResponse404> bad input parameter
   * @throws FetchError<500, types.RepeatTextindexDataResponse500> internal server error
   */
  repeatTextindexData(body: types.RepeatTextindexDataBodyParam, metadata: types.RepeatTextindexDataMetadataParam): Promise<FetchResponse<200, types.RepeatTextindexDataResponse200>> {
    return this.core.fetch('/repeat-text/v1/instances/{instanceId}/documents/index', 'post', body, metadata);
  }

  /**
   * Delete data from instances
   *
   * @summary Delete Documents by ID
   * @throws FetchError<400, types.RepeatTextdeleteDataPathResponse400> bad input parameter
   * @throws FetchError<500, types.RepeatTextdeleteDataPathResponse500> internal server error
   */
  repeatTextdeleteDataPath(metadata: types.RepeatTextdeleteDataPathMetadataParam): Promise<FetchResponse<200, types.RepeatTextdeleteDataPathResponse200>> {
    return this.core.fetch('/repeat-text/v1/instances/{instanceId}/documents/{documentId}', 'delete', metadata);
  }

  /**
   * Delete data from instances
   *
   * @summary Delete Documents by ExternalID
   * @throws FetchError<400, types.RepeatTextdeleteDataQueryResponse400> bad input parameter
   * @throws FetchError<500, types.RepeatTextdeleteDataQueryResponse500> internal server error
   */
  repeatTextdeleteDataQuery(metadata: types.RepeatTextdeleteDataQueryMetadataParam): Promise<FetchResponse<200, types.RepeatTextdeleteDataQueryResponse200>> {
    return this.core.fetch('/repeat-text/v1/instances/{instanceId}/documents', 'delete', metadata);
  }

  /**
   * Perform Repeat Text Matching
   *
   * @summary Submit Repeat Text Matching
   * @throws FetchError<400, types.RepeatTextmatchResponse400> bad input parameter
   * @throws FetchError<500, types.RepeatTextmatchResponse500> internal server error
   */
  repeatTextmatch(body: types.RepeatTextmatchBodyParam, metadata: types.RepeatTextmatchMetadataParam): Promise<FetchResponse<200, types.RepeatTextmatchResponse200>> {
    return this.core.fetch('/repeat-text/v1/instances/{instanceId}/matches', 'post', body, metadata);
  }

  /**
   * Perform Repeat Text Matching
   *
   * @summary Get Repeat Text Matching Response
   * @throws FetchError<400, types.RepeatTextmatchGetResponse400> bad input parameter
   * @throws FetchError<500, types.RepeatTextmatchGetResponse500> internal server error
   */
  repeatTextmatchGet(metadata: types.RepeatTextmatchGetMetadataParam): Promise<FetchResponse<200, types.RepeatTextmatchGetResponse200>> {
    return this.core.fetch('/repeat-text/v1/instances/{instanceId}/matches/{transactionId}', 'get', metadata);
  }

  /**
   * List Repeat Text Matches
   *
   * @summary List Repeat Check Transactions
   */
  repeatTextlist(metadata?: types.RepeatTextlistMetadataParam): Promise<FetchResponse<200, types.RepeatTextlistResponse200>> {
    return this.core.fetch('/repeat-text/v1/matches', 'get', metadata);
  }

  /**
   * Get Submitted Image
   *
   * @summary Get Submitted Image
   * @throws FetchError<400, types.RepeatTextmatchGetSubmittedImageResponse400> bad input parameter
   * @throws FetchError<500, types.RepeatTextmatchGetSubmittedImageResponse500> internal server error
   */
  repeatTextmatchGetSubmittedImage(metadata: types.RepeatTextmatchGetSubmittedImageMetadataParam): Promise<FetchResponse<200, types.RepeatTextmatchGetSubmittedImageResponse200>> {
    return this.core.fetch('/repeat-text/v1/instances/{instanceId}/matches/{transactionId}/images/submitted', 'get', metadata);
  }

  /**
   * Get Matched Image
   *
   * @summary Get Matched Image
   * @throws FetchError<400, types.RepeatTextmatchGetMatchedImageResponse400> bad input parameter
   * @throws FetchError<500, types.RepeatTextmatchGetMatchedImageResponse500> internal server error
   */
  repeatTextmatchGetMatchedImage(metadata: types.RepeatTextmatchGetMatchedImageMetadataParam): Promise<FetchResponse<200, types.RepeatTextmatchGetMatchedImageResponse200>> {
    return this.core.fetch('/repeat-text/v1/instances/{instanceId}/matches/{transactionId}/images/matched/{matchedDocumentId}', 'get', metadata);
  }

  /**
   * Get Delta Image Between Submitted and Matched Image
   *
   * @summary Get Delta Image
   * @throws FetchError<400, types.RepeatTextmatchGetMatchedDeltaImageResponse400> bad input parameter
   * @throws FetchError<500, types.RepeatTextmatchGetMatchedDeltaImageResponse500> internal server error
   */
  repeatTextmatchGetMatchedDeltaImage(metadata: types.RepeatTextmatchGetMatchedDeltaImageMetadataParam): Promise<FetchResponse<200, types.RepeatTextmatchGetMatchedDeltaImageResponse200>> {
    return this.core.fetch('/repeat-text/v1/instances/{instanceId}/matches/{transactionId}/images/matched/{matchedDocumentId}/delta', 'get', metadata);
  }

  /**
   * Get Negative Image Between Submitted and Matched Image
   *
   * @summary Get Negative Image
   * @throws FetchError<400, types.RepeatTextmatchGetMatchedNegativeImageResponse400> bad input parameter
   * @throws FetchError<500, types.RepeatTextmatchGetMatchedNegativeImageResponse500> internal server error
   */
  repeatTextmatchGetMatchedNegativeImage(metadata: types.RepeatTextmatchGetMatchedNegativeImageMetadataParam): Promise<FetchResponse<200, types.RepeatTextmatchGetMatchedNegativeImageResponse200>> {
    return this.core.fetch('/repeat-text/v1/instances/{instanceId}/matches/{transactionId}/images/matched/{matchedDocumentId}/negative', 'get', metadata);
  }

  /**
   * Perform an internet search for submitted image
   *
   * @summary Search
   * @throws FetchError<400, types.InternetSearchResponse400> Validation Error
   * @throws FetchError<500, types.InternetSearchResponse500> internal server error
   */
  internetSearch(body: types.InternetSearchBodyParam): Promise<FetchResponse<200, types.InternetSearchResponse200>> {
    return this.core.fetch('/internet-images/v1/search', 'post', body);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { AnalyzeBodyParam, AnalyzeResponse200, ClassifyBodyParam, ClassifyResponse200, ClassifyResponse400, ClassifyResponse500, DeleteDataPathMetadataParam, DeleteDataPathResponse200, DeleteDataPathResponse400, DeleteDataPathResponse404, DeleteDataPathResponse500, DeleteDataQueryMetadataParam, DeleteDataQueryResponse200, DeleteDataQueryResponse400, DeleteDataQueryResponse404, DeleteDataQueryResponse500, DeleteInstanceMetadataParam, DeleteInstanceRepeatTextMetadataParam, DeleteInstanceRepeatTextResponse200, DeleteInstanceRepeatTextResponse404, DeleteInstanceRepeatTextResponse500, DeleteInstanceResponse200, DeleteInstanceResponse400, DeleteInstanceResponse404, DeleteInstanceResponse500, FaceMatchVerifyBodyParam, FaceMatchVerifyResponse200, FaceMatchVerifyResponse400, FaceMatchVerifyResponse401, FaceMatchVerifyResponse500, FraudCheckBodyParam, FraudCheckGetMetadataParam, FraudCheckGetResponse200, FraudCheckGetResponse400, FraudCheckGetResponse404, FraudCheckGetResponse500, FraudCheckMetadataParam, FraudCheckResponse200, FraudCheckResponse400, FraudCheckResponse404, FraudCheckResponse500, IndexDataBodyParam, IndexDataMetadataParam, IndexDataResponse200, IndexDataResponse400, IndexDataResponse404, IndexDataResponse500, InternetSearchBodyParam, InternetSearchResponse200, InternetSearchResponse400, InternetSearchResponse500, ListInstanceMetadataParam, ListInstanceResponse200, ListInstanceResponse400, ListInstanceResponse500, ListMetadataParam, ListResponse200, LivenessVerifyBodyParam, LivenessVerifyResponse200, LivenessVerifyResponse400, LivenessVerifyResponse401, LivenessVerifyResponse500, MatchBodyParam, MatchGetMatchedDeltaImageMetadataParam, MatchGetMatchedDeltaImageResponse200, MatchGetMatchedDeltaImageResponse400, MatchGetMatchedDeltaImageResponse500, MatchGetMatchedImageMetadataParam, MatchGetMatchedImageResponse200, MatchGetMatchedImageResponse400, MatchGetMatchedImageResponse500, MatchGetMatchedNegativeImageMetadataParam, MatchGetMatchedNegativeImageResponse200, MatchGetMatchedNegativeImageResponse400, MatchGetMatchedNegativeImageResponse500, MatchGetMetadataParam, MatchGetResponse200, MatchGetResponse400, MatchGetResponse404, MatchGetResponse500, MatchGetSubmittedImageMetadataParam, MatchGetSubmittedImageResponse200, MatchGetSubmittedImageResponse400, MatchGetSubmittedImageResponse500, MatchMetadataParam, MatchResponse200, MatchResponse400, MatchResponse404, MatchResponse500, ProvisionBodyParam, ProvisionResponse200, ProvisionResponse400, ProvisionResponse500, RepeatImagedeleteDataPathMetadataParam, RepeatImagedeleteDataPathResponse200, RepeatImagedeleteDataPathResponse400, RepeatImagedeleteDataPathResponse500, RepeatImagedeleteDataQueryMetadataParam, RepeatImagedeleteDataQueryResponse200, RepeatImagedeleteDataQueryResponse400, RepeatImagedeleteDataQueryResponse500, RepeatImagedeleteInstanceMetadataParam, RepeatImagedeleteInstanceResponse200, RepeatImagedeleteInstanceResponse404, RepeatImagedeleteInstanceResponse500, RepeatImageindexDataBodyParam, RepeatImageindexDataMetadataParam, RepeatImageindexDataResponse200, RepeatImageindexDataResponse400, RepeatImageindexDataResponse404, RepeatImageindexDataResponse500, RepeatImagelistInstanceMetadataParam, RepeatImagelistInstanceResponse200, RepeatImagelistInstanceResponse400, RepeatImagelistInstanceResponse404, RepeatImagelistInstanceResponse500, RepeatImagematchBodyParam, RepeatImagematchGetMetadataParam, RepeatImagematchGetResponse200, RepeatImagematchGetResponse400, RepeatImagematchGetResponse500, RepeatImagematchMetadataParam, RepeatImagematchResponse200, RepeatImagematchResponse400, RepeatImagematchResponse500, RepeatImageprovisionBodyParam, RepeatImageprovisionResponse200, RepeatImageprovisionResponse400, RepeatImageprovisionResponse500, RepeatTextProvisionBodyParam, RepeatTextProvisionResponse200, RepeatTextProvisionResponse400, RepeatTextProvisionResponse500, RepeatTextdeleteDataPathMetadataParam, RepeatTextdeleteDataPathResponse200, RepeatTextdeleteDataPathResponse400, RepeatTextdeleteDataPathResponse500, RepeatTextdeleteDataQueryMetadataParam, RepeatTextdeleteDataQueryResponse200, RepeatTextdeleteDataQueryResponse400, RepeatTextdeleteDataQueryResponse500, RepeatTextindexDataBodyParam, RepeatTextindexDataMetadataParam, RepeatTextindexDataResponse200, RepeatTextindexDataResponse400, RepeatTextindexDataResponse404, RepeatTextindexDataResponse500, RepeatTextlistInstanceMetadataParam, RepeatTextlistInstanceResponse200, RepeatTextlistInstanceResponse400, RepeatTextlistInstanceResponse404, RepeatTextlistInstanceResponse500, RepeatTextlistMetadataParam, RepeatTextlistResponse200, RepeatTextmatchBodyParam, RepeatTextmatchGetMatchedDeltaImageMetadataParam, RepeatTextmatchGetMatchedDeltaImageResponse200, RepeatTextmatchGetMatchedDeltaImageResponse400, RepeatTextmatchGetMatchedDeltaImageResponse500, RepeatTextmatchGetMatchedImageMetadataParam, RepeatTextmatchGetMatchedImageResponse200, RepeatTextmatchGetMatchedImageResponse400, RepeatTextmatchGetMatchedImageResponse500, RepeatTextmatchGetMatchedNegativeImageMetadataParam, RepeatTextmatchGetMatchedNegativeImageResponse200, RepeatTextmatchGetMatchedNegativeImageResponse400, RepeatTextmatchGetMatchedNegativeImageResponse500, RepeatTextmatchGetMetadataParam, RepeatTextmatchGetResponse200, RepeatTextmatchGetResponse400, RepeatTextmatchGetResponse500, RepeatTextmatchGetSubmittedImageMetadataParam, RepeatTextmatchGetSubmittedImageResponse200, RepeatTextmatchGetSubmittedImageResponse400, RepeatTextmatchGetSubmittedImageResponse500, RepeatTextmatchMetadataParam, RepeatTextmatchResponse200, RepeatTextmatchResponse400, RepeatTextmatchResponse500, TextractBodyParam, TextractResponse200, TextractResponse400, TextractResponse500, VerifyBodyParam, VerifyResponse200, VerifyResponse400, VerifyResponse500 } from './types';
