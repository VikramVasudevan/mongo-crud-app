# Mongo CRUD App

This application has been developed by **Ekahaa Solutions India Pvt Ltd.** and is used to maintain data in a mongo DB. 

It has pre-built screens that help perform CRUD operations on the Mongo DB.

Things to do before you have a working application:
1. Modify .env file and change the `MONGODB_URL` variable to your mongo instance URL.
2. run the following command from the root folder of this project to install all dependencies.
  - > npm install
3. Replace `logo.png` with your brand logo.
4. Add and maintain your schema files under `shared_modules/mongodb/models/` directory. Please refer to the `test_collection1.js` for example.
5. Modify `getMasterDataEntityList` function in `service.js` under `routes/masterData/` directory to configure all the master data you want to edit using this application.
6. Use `Dockerfile` and build your own docker image
7. Voila! you are all set!


Hope you enjoy this app.

Feedback is always welcome.

![Ekahaa Solutions India Pvt Ltd.](/public/img/logo.png "Ekahaa Solutions India Pvt Ltd.")

&copy;copyright 2022 Ekahaa Solutions India Pvt Ltd. All Rights Reserved.
