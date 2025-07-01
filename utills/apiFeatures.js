// ovde ce biti klasa koja ce imati svu logiku za paginaciju, filtriranje i sortiranje

class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  parseQuery(query) {
    const mongoQuery = {};
    // OVDE JE GRESKA PROSLEDJUJE SE REFERENCA I ONDA SE OBRISE SVE

    for (const key in query) {
      const match = key.match(/(\w+)\[(\w+)\]/);
      if (match) {
        const field = match[1];
        const operator = `$${match[2]}`;
        if (!mongoQuery[field]) mongoQuery[field] = {};
        mongoQuery[field][operator] = Number(query[key]);
      } else {
        mongoQuery[key] = Number(query[key]) || query[key];
      }
    }
    delete mongoQuery.sort;
    delete mongoQuery.page;
    delete mongoQuery.limit;
    delete mongoQuery.fields;

    return mongoQuery;
  }

  filter() {
    let filtersObject = this.queryString
      ? this.parseQuery(this.queryString)
      : null;

    this.query = this.query.find(filtersObject);
    console.log("filter", this.queryString);
    return this;
  }
  sort() {
    let sortingString = this.queryString.sort
      ? this.queryString.sort.split(",").join(" ")
      : null;

    this.query = this.query.sort(sortingString);
    console.log("sort", this.queryString);
    return this;
  }
  paginate() {
    // isto treba da se vodi racuna za edge case kada je resultRows veci od broja redova, tada smo na zadnjoj stranici
    const page = this.queryString.page ? this.queryString.page * 1 : 1;
    console.log("paginate", this.queryString);
    const limitPerPage = this.queryString.limit
      ? this.queryString.limit * 1
      : 10;

    const resultRows = (page - 1) * limitPerPage;

    this.query = this.query.skip(resultRows).limit(limitPerPage);

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      this.query = this.query.select(this.queryString.fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
}

module.exports = ApiFeatures;
