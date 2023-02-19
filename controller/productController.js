const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const AsyncError = require("../middleware/asyncError");
const ApiFeatures = require("../utils/apiFeatures");
const cloudinary = require("cloudinary");

//Create Product --Admin
exports.createProduct = AsyncError(async (req, res, next) => {
    req.body.user = req.user.id;
    let images = [];
    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    const imageLink = [];
    for (var i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "products",
        });
        imageLink.push({
            public_id: result.public_id,
            url: result.secure_url,
        });
    }
    req.body.images = imageLink;
    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        product,
    });
});
//Get Admin product
exports.getAdminProduct = async (req, res, next) => {
    const products = await Product.find();
    if (!products) {
        return next(new ErrorHandler("No product", 500));
    }

    res.status(200).json({
        success: true,
        products,
    });
};
//Get all product
exports.getAllProduct = async (req, res, next) => {
    const resultPerPage = 8;
    const productCount = await Product.countDocuments();
    // const products = Product.find();
    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resultPerPage);

    // console.log(apiFeature.query);
    let products = await apiFeature.query;
    // console.log(products);
    // let filteredProductCount = products.length;
    // apiFeature.pagination(resultPerPage);

    // products = await apiFeature.query;
    // let products=null;
    if (!products) {
        return next(new ErrorHandler("No product", 500));
    }
    res.status(200).json({
        success: true,
        productCount,
        products,
        resultPerPage,
    });
};

//Get Single Product
exports.getProductDetails = AsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("No product found", 500));
    }
    return res.status(200).json({
        success: true,
        product,
    });
});

//Update Product --Admin
exports.updateProduct = AsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("No product found"), 500);
    }

    let images = [];
    if (typeof req.body.images === "string") {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }
    if (images !== undefined) {
        for (var i = 0; i < product.images.length; i++) {
            await cloudinary.v2.uploader.destroy(product.images[i].public_id);
        }

        const imageLink = [];
        for (var i = 0; i < images.length; i++) {
            const result = await cloudinary.v2.uploader.upload(images[i], {
                folder: "products",
            });
            imageLink.push({
                public_id: result.public_id,
                url: result.secure_url,
            });
        }
        req.body.images = imageLink;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    return res.status(200).json({
        success: true,
        product,
    });
});

//Delete Product --admin
exports.deleteProduct = AsyncError(async (req, res, next) => {
    let product = await Product.findById(req.params.id);
    if (!product) {
        return next(new ErrorHandler("No product found"), 500);
    }
    for (var i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }
    await product.remove();
    return res.status(200).json({
        success: true,
        message: "Product deleted",
    });
});

//Create new review or update review
exports.createProductReview = AsyncError(async (req, res, next) => {
    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment,
    };
    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find((rev) => {
        (rev) => rev.user.toString() === req.user._id.toString();
    });

    if (isReviewed) {
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user_id.toString()) {
                (rev.rating = rating), (rev.comment = comment);
            }
        });
    } else {
        product.reviews.push(review);
    }
    let sum = 0;
    product.reviews.forEach((rev) => {
        sum += rev.rating;
    });
    product.rating = sum / product.reviews.length;
    product.numOfReviews = product.reviews.length;
    await product.save({ validateBeforeSave: false });
    res.status(200).json({
        success: true,
        product,
    });
});

//Get All reviews of a Product
exports.getProductReviews = AsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.id);
    if (!product) {
        return next(new ErrorHandler(`No product found`), 404);
    }
    const reviews = product.reviews;
    res.status(200).json({
        success: true,
        reviews,
    });
});

//Delete a review
exports.deleteReview = AsyncError(async (req, res, next) => {
    const product = await Product.findById(req.query.productId);
    if (!product) {
        return next(new ErrorHandler(`No product found`), 404);
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() != req.query.id.toString()
    );

    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating;
    });
    if (reviews.length === 0) {
        rating = 0;
    } else {
        rating = avg / reviews.length;
    }
    numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            rating,
            numOfReviews,
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: true,
        }
    );
    res.status(200).json({
        success: true,
        reviews,
    });
});
