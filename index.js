const express = require("express");
// server is 100% DEAF and BLIND
const server = express();
server.use(express.json())

const fetch = require("node-fetch");

//Variable importing random number generator
const { generateID } = require("./services")

//Variable importing the destinations
let { destinations } = require("./db");

//port to listen - home address
server.listen(process.env.PORT || 3000, function(){
    console.log("Server listening on PORT 3000")
});

// POST => create destinations
// data => (name^, location^, photo, description) - ^mean required
server.post("/destinations", async (req, res) => {
    //console.log(req.body);
    const { name, location, photo, description } = req.body

    // Validate we have a NAME and LOCATION as they are required
    if (!name || name.length === 0 || !location || location.length === 0) {
        return res
            .status(400)
            .json({ message: "Name and Location are both required" });
    }

    const dest = { id: generateID(), name, location }

    const UNSPLASH_URL = `https://api.unsplash.com/photos/random?client_id=8gYRSsw1qJAHt71qdd9Wt1WqNVO0TjM2SupN2ku_2kk&q=${name}${location}`;;
    
    try {
        const fetchRes = await fetch(UNSPLASH_URL);
        const data = await fetchRes.json();
        dest.photo = data.urls.small
        
    } catch (error) {
        // default image
        dest.photo = "https://ceblog.s3.amazonaws.com/wp-content/uploads/2012/05/20172622/ce-travel.jpg";
    }

    if (description && description.length !== 0) {
        dest.description = description
    }

    destinations.push(dest);

    res.redirect("/destinations");
});

// GET => gets all destinations
server.get("/destinations", (req, res) => {
    res.send(destinations)
});


// PUT => edit the destinations
server.put("/destinations/", (req, res) => {
    const { id, name, location, photo, description } = req.body

    if (id === undefined) {
        return res.status(400).json({ message: "id is required" }) // ID is required
    }
    if (name !== undefined && name.length === 0) {
        return res.status(400).json({ message: "Name can't be empty" }); //NAME is required
    }

    if (location !== undefined && location.length === 0) {
        return res.status(400).json({ message: "Location can't be empty" }) //LOCATION is required
    }

    for (const dest of destinations) {
        if (dest.id === id)
            if (name !== undefined) {
                dest.name = name
            }

        if (location !== undefined) {
            dest.location = location
        }

        if (photo !== undefined) {
            dest.photo = photo
        }

        if (description !== undefined) {
            dest.description = description
        }

        return res.json(dest);
    }

})

// DELETE => delete a destination
server.delete("/destinations/:id", (req, res) => {
    const destId = req.params.id;

    const newDestinations = destinations.filter((dest) => dest.id !== destId);
    destinations = newDestinations;
    res.redirect("/destinations");
})



