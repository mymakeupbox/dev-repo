const RequestError = require("./models/RequestError");
const USER_DYNAMO_CONTROLLER = require("./controller/user/DynamoController");
const PURCHASES_DYNAMO_CONTROLLER = require("./controller/purchases/DynamoController");
const INTERACTION_HISTORY_DYNAMO_CONTROLLER = require("./controller/interactionHistory/DynamoController");
const FAVOURITE_DYNAMO_CONTROLLER = require("./controller/favourite/DynamoController");
const DIALOG_DYNAMO_CONTROLLER = require("./controller/dialog/DynamoController");
const ROUTINE_DYNAMO_CONTROLLER = require("./controller/routine/DynamoController");
const DEMO_DYNAMO_CONTROLLER = require("./controller/demo/DynamoController");
const Response = require("./models/Response");
const LoggingHelper = require("./utils/LoggingHelper");
const ResponseHelper = require("./utils/ResponseHelper");
const User = require("./models/User");
const moment = require("moment");
const warmer = require('lambda-warmer');
var randomstring = require("randomstring");


// Constants
const ResourcesEnum = {
  USER: {
    RETRIEVE_USER: "/v1/user/getUserById",
    CHECK_SUBSCRIBER: "/v1/user/checkSubscriberById",
    UPDATE_SUBSCRIBER: "/v1/user/updateSubscriber",
    GET_PURCHASES: "/v1/user/getPurchases",
    ADD_NEW_USER: "/v1/user/addNewUser",
    GET_USER_TOOLS: "/v1/user/getUserTools",
    ADD_NEW_USER_TOOL: "/v1/user/addNewUserTool",
    ADD_SKIN_TONE: "/v1/user/addSkinTone",
    ADD_EYE_SHAPE: "/v1/user/addEyeShape",
    UPDATE_USAGE_COUNT: "/v1/user/updateUsageCount",
    USER_LOGIN: "/v1/user/userLogin",
    GET_USER_LEVEL: "/v1/user/getUserLevel"
  },
  PURCHASES: {
    ADD_NEW_PURCHASE: "/v1/purchases/addNewPurchase",
    GET_LATEST_PURCHASE_BY_USERID: "/v1/purchases/getLatestPurchaseByUserId"
  },
  INTERACTION_HISTORY: {
    ADD_NEW_INTERACTION: "/v1/interaction/addNewInteraction",
    GET_INTERACTIONS_BY_ID: "/v1/interaction/getInteractionsByUserId"
  },
  FAVOURITE: {
    ADD_NEW_FAVOURITE: "/v1/favourite/addNewFavourite",
    GET_FAVOURITES_BY_ID: "/v1/favourite/getFavouritesByUserId"
  },
  DIALOG: {
    GET_DIALOG_BY_TAG: "/v1/dialog/getDialogByTag"
  },
  ROUTINE: {
    GET_ROUTINE_BY_TAG: "/v1/routine/getRoutineByTag",
    GET_ALL_ROUTINES: "/v1/routine/getAllRoutines"
  },
  DEMO: {
    GET_DEMO_BY_ID: "/v1/demo/getDemoById",
    GET_DEMO_BY_TAG: "/v1/demo/getDemoByTag"
  }
};

const HttpCodesEnum = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  PRECONDITION_FAILED: 412,
  UNPROCESSABLE_ENTITY: 422,
  SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501
};

/**
 * handleApiRequest
 * - Handle the api request from the API Gateway
 * @param {obj} event
 */
exports.handler = async (event, context) => {

  if (await warmer(event)) return 'warmed';

  var apiRequestId;

  try {
    apiRequestId = event.requestContext.requestId;
  } catch (error) {
    apiRequestId = randomstring.generate();
  }

  //var lambdaRequestId = context.awsRequestId;

  // Create a logger based on the lambdaRequestId header value
  const loggingHelper = LoggingHelper.getInstance(apiRequestId);

  loggingHelper.info("Handler event", event);

  // Create an instance of the reponse helper object
  const responseHelper = new ResponseHelper(event, loggingHelper);

  // based on the resource i.e. /retrieveUser do some logic
  switch (event.requestPath) {


    //-----------
    // Demo
    //-----------
    case ResourcesEnum.DEMO.GET_DEMO_BY_ID:

      try {
        const demoId = event.query.demoId;

        // Get a new instance of the database controller and call the add new interaction handler.
        const response = await DEMO_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).getDemoById(demoId);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }
      break;

    case ResourcesEnum.DEMO.GET_DEMO_BY_TAG:

      try {
        const request = event.body;

        // Get a new instance of the database controller and call the add new interaction handler.
        const response = await DEMO_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).getDemoByTag(request);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }
      break;


      //-----------
      // Routine
      //-----------
    case ResourcesEnum.ROUTINE.GET_ROUTINE_BY_TAG:

      try {
        const request = event.body;

        // Get a new instance of the database controller and call the add new interaction handler.
        const response = await ROUTINE_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).getRoutineByTag(request.tagIds);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }
      break;


    case ResourcesEnum.ROUTINE.GET_ALL_ROUTINES:

      try {

        // Get a new instance of the database controller and call the add new interaction handler.
        const response = await ROUTINE_DYNAMO_CONTROLLER.getInstance(loggingHelper).getAllRoutines();

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );

      } catch (err) {
        return responseHelper.getErrorResponse(err);
      }

      //-----------
      // DIALOG
      //-----------
    case ResourcesEnum.DIALOG.GET_DIALOG_BY_TAG:

      try {
        const tagId = event.query.tagId;
        const userId = event.query.userId;

        // Get a new instance of the database controller and call the add new interaction handler.
        const response = await DIALOG_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).getDialogByTag(userId, tagId);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }
      break;


      //-----------
      // FAVOURITE
      //-----------
    case ResourcesEnum.FAVOURITE.ADD_NEW_FAVOURITE:

      try {
        const request = event.body;

        // Get a new instance of the database controller and call the add new interaction handler.
        const response = await FAVOURITE_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).addNewFavourite(request);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }
      break;

      // GET_FAVOURITES_BY_ID
    case ResourcesEnum.FAVOURITE.GET_FAVOURITES_BY_ID:

      try {
        const userId = event.query.userId;

        // Get a new instance of the database controller and call the add new interaction handler.
        const response = await FAVOURITE_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).getFavouritesByUserId(userId);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }

      break;

      //------------
      // INTERACTION
      //------------
      // add a new interaction record to the table
    case ResourcesEnum.INTERACTION_HISTORY.ADD_NEW_INTERACTION:

      try {
        const request = event.body;

        // Get a new instance of the database controller and call the add new interaction handler.
        const response = await INTERACTION_HISTORY_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).addNewInteraction(request);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }

      break;

      /**
       * Get interactions by user id filtered on event type
       */
    case ResourcesEnum.INTERACTION_HISTORY.GET_INTERACTIONS_BY_ID:

      try {
        const userId = event.query.userId;
        const eventType = event.query.eventType;

        // Get a new instance of the database controller and call the add new interaction handler.
        const response = await INTERACTION_HISTORY_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).getInteractionsByUserId(userId, eventType);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }

      break;

      //-----------
      // PURCHASES 
      //-----------
      // Add new purchase
    case ResourcesEnum.PURCHASES.ADD_NEW_PURCHASE:
      try {
        const request = event.body;

        // Get a new instance of the database controller and then add a new user.
        const response = await PURCHASES_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).addNewPurchase(request);
        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }

      break;

      // Get latest purchase by user id
    case ResourcesEnum.PURCHASES.GET_LATEST_PURCHASE_BY_USERID:

      try {
        const userId = event.query.userId;

        // Get a new instance of the database controller and call the add new interaction handler.
        const response = await PURCHASES_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).getLatestPurchaseByUserId(userId);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }

      break;

      //-------------
      // USER
      //-------------

      // process the API call to /retrieveUser
    case ResourcesEnum.USER.RETRIEVE_USER:
      try {
        const userId = event.query.userId;

        // Get a new instance of the database controller and then add a new user.
        const response = await USER_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).getUserById(userId);

        console.log('...> response ', JSON.stringify(response));

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }

      break;
      // Check if the user is subscribe or not
    case ResourcesEnum.USER.CHECK_SUBSCRIBER:
      try {
        const userId = event.query.userId;

        // Get a new instance of the database controller and then add a new user.
        const response = await USER_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).checkSubscriber(userId);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }

      break;
      // Get purchases for user Id
    case ResourcesEnum.USER.GET_PURCHASES:
      try {
        const userId = event.query.userId;

        // Get a new instance of the database controller and then add a new user.
        const response = await USER_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).getPurchases(userId);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }

      break;

      //  Update the subscriber flag
    case ResourcesEnum.USER.UPDATE_SUBSCRIBER:
      try {
        const request = event.body;

        const userId = event.query.userId;

        console.log('.....request ', request);


        // Get a new instance of the database controller and then add a new user.
        const response = await USER_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).updateSubscriber(userId, request.subscriberFlag);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }

      break;

      // Add a new user
    case ResourcesEnum.USER.ADD_NEW_USER:
      try {
        const request = event.body;

        // Get a new instance of the database controller and then add a new user.
        const response = await USER_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).addNewUser(request);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }

      break;

    case ResourcesEnum.USER.GET_USER_TOOLS:
      try {
        const userId = event.query.userId;

        // Get a new instance of the database controller and then add a new user.
        const response = await USER_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).getUserTools(userId);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }

      break;

    case ResourcesEnum.USER.ADD_NEW_USER_TOOL:
      try {
        const userId = event.query.userId;
        const request = event.body;

        // Get a new instance of the database controller and then add a new user.
        const response = await USER_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).addNewUserTool(userId, request.toolId);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }

      break;

      // Add a new user
    case ResourcesEnum.USER.ADD_SKIN_TONE:
      try {
        const userId = event.query.userId;
        const request = event.body;

        console.log("request = ", request);

        // Get a new instance of the database controller and then add a new user.
        const response = await USER_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).addSkinTone(userId, request.skinTone);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }

      break;

    case ResourcesEnum.USER.ADD_EYE_SHAPE:
      try {
        const userId = event.query.userId;
        const request = event.body;

        // Get a new instance of the database controller and then add a new user.
        const response = await USER_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).addEyeShape(userId, request.eyeShape);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }

      break;

      // Update the usage count of the user
    case ResourcesEnum.USER.UPDATE_USAGE_COUNT:
      try {
        const userId = event.query.userId;

        // Get a new instance of the database controller and update the usage count
        const response = await USER_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).updateUsageCount(userId);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }

      break;

      // Get the user level 
    case ResourcesEnum.USER.GET_USER_LEVEL:
      try {
        const userId = event.query.userId;

        // Get a new instance of the database controller and update the usage count
        const response = await USER_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).getUserLevel(userId);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }

      break;

      /**
       * userLogin - login the user by increasing the usage coun and also
       * the streak if needed
       */
    case ResourcesEnum.USER.USER_LOGIN:
      try {
        const userId = event.query.userId;
        const request = event.body;

        //The update streak
        let updateStreak = false;

        // Get the lastUsedTimeStamp from the database
        let lastUsedTimeStamp = await USER_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).getLastUsedTimestamp(userId);

        if (lastUsedTimeStamp) {
          lastUsedTimeStamp =
            lastUsedTimeStamp.rtnData.Items[0].lastUsedTimestamp;

          // Calculate if we need to update the streak
          var startDate = moment.unix(lastUsedTimeStamp); // converted value
          var endDate = moment.unix(request.currentTimeStamp); // converted value

          console.log("...difference = ", endDate.diff(startDate, "days"));

          if (endDate.diff(startDate, "days") === 1) {
            // set the flag to update the streak
            updateStreak = true;
          }
        }

        // Get a new instance of the database controller and update the usage count
        const response = await USER_DYNAMO_CONTROLLER.getInstance(
          loggingHelper
        ).userLogin(userId, updateStreak, request.currentTimeStamp);

        return responseHelper.getSuccessfulResponse(
          new Response(HttpCodesEnum.OK, response)
        );
      } catch (err) {
        // return an error if anythin in the try block fails
        return responseHelper.getErrorResponse(err);
      }
      break;

    default:
      break;
  }
  // Here the api resource endpoint is not setup
  const error = new RequestError(
    HttpCodesEnum.BAD_REQUEST,
    `Resource doesn't exist - ${JSON.stringify(event.resource)}`, {}
  );
  return responseHelper.getErrorResponse(error);
};