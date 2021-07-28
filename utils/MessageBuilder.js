class MessageBuilder {

  constructor(message) {

    this.message = message;

  }

  setParam(paramName, paramValue) {

    let paramRegex = new RegExp(paramName, "g");

    this.message = this.message.replace(paramRegex, paramValue);

    return this;

  }

  add(string, paramName, paramValue) {

    let paramRegex = new RegExp(paramName, "g");

    string = string.replace(paramRegex, paramValue);

    this.message.concat(string);

    return this;

  }

  build() {

      return this.message;

  }


}

module.exports = MessageBuilder;