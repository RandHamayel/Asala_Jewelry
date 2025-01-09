import slugify from "slugify";
import productModel from "../../../db/model/product.model.js";
import categoryModel from "../../../db/model/category.model.js";
import { pagination } from "../../utls/pagination.js";
import cloudinary from "../../utls/cloudinary.js";

export const create = async(req,res)=>{

	const {name,categoryId} = req.body;

	const checkCategory = await categoryModel.findById(categoryId);
	if(!checkCategory){
		return res.status(404).json({ msg: "Category not found" });

	}

	req.body.slug = slugify(name);

	const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
			folder: `${process.env.APPNAME}/product/${name}`,
		});
		req.body.image = {secure_url, public_id};


		const product = await productModel.create(req.body);
		return res.status(201).json({msg: "success", product });

};

export const getProducts = async(req,res)=>{

	const {skip,limit} = pagination(req.query.page, req.query.limit)
	let queryObj = {...req.query};
	const execQuery = ['page','limit'];

	execQuery.map((ele)=>{
		delete queryObj[ele];
	})

    queryObj = JSON.stringify(queryObj);

	queryObj = queryObj.replace(/gte|gt|lt|lte|in|nin|eq/g,match => `$${match}`);
	queryObj = JSON.parse(queryObj);

	const mongooseQuery =  productModel.find(queryObj).skip(skip).limit(limit).select('name price');
	const products = await mongooseQuery.sort('price').select('name description price categoryId image ');
	return res.status(200).json({msg: "success", products });

}
