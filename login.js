const express = require('express');
const router = express.Router();
module.exports = () => {
  router.post('/signup', ExpressRouterAdapter.adapt(new SignUpRouter()));
};

class ExpressRouterAdapter {
  static adapt (router) {
    return async (req, res) => {
      const httpRequest = {
        body: req.body
      };
      const httpResponse = await router.route(httpRequest);
      res.status(httpResponse.statusCode).json(httpResponse.body);
    };
  }
}

// Presentation Layer
// singup-router.js
class SignUpRouter {
  async route (httpRequest) {
    const { email, password, repeatPassword } = httpRequest.body;
    const user = new SignUpUseCase().signUp(email, password, repeatPassword);
    return {
      statusCode: 200,
      body: user
    };
  }
}

// Domain Layer
// signup-usecase.js
class SignUpUseCase {
  async signUp (email, password, repeatPassword) {
    if (password === repeatPassword) {
      new AddAccountRepository().add(email, password);
    }
  }
}

// Infra Layer
// add-account-repository.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const AccountModel = mongoose.model('Account', accountSchema);

class AddAccountRepository {
  async add (email, password, repeatPassword) {
    const user = await AccountModel.create({ email, password });
    return user;
  }
}
