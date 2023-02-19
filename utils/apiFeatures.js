class ApiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        const keyword = this.queryStr.keyword
            ? {
                  name: {
                      $regex: this.queryStr.keyword,
                      $options: "i",
                  },
              }
            : {};
        this.query = this.query.find({ ...keyword });
        return this;
    }
    filter() {
        const queryCopy = { ...this.queryStr };
        const removeField = ["keyword", "limit", "page"];
        removeField.forEach((key) => delete queryCopy[key]);

        let queryStr = JSON.stringify(queryCopy);
        //Adding $ before lt rt lte rte
        // queryStr = queryStr.replace(/\b(lt|gt|lte|gte)\b/g, (key) => `$${key}`);
        queryStr = queryStr.replace(/\b(lte|gte)\b/g, (key) => `$${key}`);
        // this.query = this.query.find(JSON.parse(queryStr));
        // this.query = this.query.find();

        queryStr = JSON.parse(queryStr);
        queryStr.price["$gte"] = parseInt(queryStr.price["$gte"]);
        queryStr.price["$lte"] = parseInt(queryStr.price["$lte"]);

        if (queryStr.category)
            this.query = this.query.find({
                category: queryStr.category,
                rating: queryStr.rating,
                price: queryStr.price,
            });
        else
            this.query = this.query.find({
                rating: queryStr.rating,
                price: queryStr.price,
            });
        return this;
    }

    pagination(resultPage) {
        const currPage = Number(this.queryStr.page) || 1;
        const skip = resultPage * (currPage - 1);
        this.query = this.query.limit(resultPage).skip(skip);
        return this;
    }
}
module.exports = ApiFeatures;
