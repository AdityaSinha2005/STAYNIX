const Listing=require("../models/listing.js");
const axios=require("axios");

module.exports.index=async(req,res)=>{
     let {search,category} = req.query;
     let allListings;
     let query={};
     if(category){
     query.category=category;
     }
     if(search) {
         query.location = {$regex:search,$options:"i"};
     }
     allListings = await Listing.find(query);
    res.render("listings/index.ejs",{allListings});
}

module.exports.renderNewForm = (req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing=async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id).populate({path:"reviews", populate: {path: "author"}}).populate("owner");
    if(!listing) {
        req.flash("error","Listing not found!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}

module.exports.createListing = async(req,res,next)=>{
     console.log("Reached createListing");
    let url = req.file.path;
    let filename = req.file.filename;
    
    const newListing = new Listing(req.body.listing);
    let location=req.body.listing.location;

let response=await axios.get(
`https://nominatim.openstreetmap.org/search?q=${location}&format=json&limit=1`,
{
headers:{
"User-Agent":"Staynix"
}
}
);

let data=response.data[0];
newListing.geometry={
    type:"Point",

    coordinates:[
        parseFloat(data.lon),
        parseFloat(data.lat)
    ]
};
    newListing.owner = req.user._id;
    newListing.image = { url, filename };
    await newListing.save();
    req.flash("success","Successfully created a new listing!");
    res.redirect("/listings");
}

module.exports.renderEditForm = async(req,res)=>{
    const {id} = req.params;

    const listing = await Listing.findById(id);

    res.render("listings/edit.ejs",{listing});
}

module.exports.updateListing = async(req,res)=>{
    const {id} = req.params;
    let listing =await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    let location=req.body.listing.location;

    let response=await axios.get(
    `https://nominatim.openstreetmap.org/search?q=${location}&format=json&limit=1`,
    {
    headers:{
    "User-Agent":"Staynix"
    }
    }
    );

    let data=response.data[0];

listing.geometry={

type:"Point",

coordinates:[
parseFloat(data.lon),
parseFloat(data.lat)
]

};
    if(typeof req.file !== "undefined") {
        let url= req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
    }
    await listing.save();
    req.flash("success","Successfully updated the listing!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async(req,res)=>{
    const {id} = req.params;

    await Listing.findByIdAndDelete(id);
req.flash("success","Successfully deleted the listing!");
    res.redirect("/listings");
}