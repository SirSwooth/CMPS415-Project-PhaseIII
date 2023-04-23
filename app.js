// modules
const express = require('express');
const fs = require('fs');
const readline = require ('readline');
const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://bradylandry:3xpLpsmn1iHMfAPf@cluster0.7otayma.mongodb.net/?retryWrites=true&w=majority"


const app = express();
const port = 3000;
app.listen(port);
console.log(`Server started at http://localhost:${port}`);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Default route:
app.get('/', (req, res) => {

    console.log('Starting program...');
    res.send('Successful Start!');

});

// Route to get all tickets:
app.get('/rest/list', (req, res) => {

    const client = new MongoClient(uri);

    var alltickets = [];

    async function run() {

        try {

            const db = client.db('Tickets');
            const collection = db.collection('TicketList');

            alltickets = await collection.find({}).toArray(function (err, data) {
                if(err) {
                    console.log(err);
                    throw err;
                } else {
                    console.log(data);
                    res.send(data);
                }
            });

        } catch (e) {
            console.log(e);
        } finally {
            await client.close();
        }

        res.send(alltickets);

    }

    run().catch(console.dir);

});

// Route to get a ticket by ID:
app.get('/rest/ticket/:id', function(req, res) {

    // ticket info
    var ticketID = Number(req.params.id);
    var ticket;

    // mongo
    const client = new MongoClient(uri);
    
    async function run() {

        try {

            const db = client.db('Tickets');
            const collection = db.collection('TicketList');

            ticket = await collection.findOne( { id: ticketID }, function (err, data) {
                if(err) {
                    console.log(err);
                    throw err;
                } else {
                    console.log(data);
                    db.close();
                }
            });

            console.log(ticket);

        } catch (e) {
            console.log(e);
        } finally {
            await client.close();
        }

        if (ticket == null) {
            res.send(`Ticket with id ${ticketID} not found`);
            console.log(`Ticket with id ${ticketID} not found`);
        } else {
            res.send(ticket);
        }

    }

    run().catch(console.dir);

});

// form route
app.get('/rest/ticket', (req, res) => {

    fs.readFile('./postform.html', 'utf-8', (err, data) => {

        if (err) {
            console.log(err);
        } else {
            res.write(data);
        }

        res.send();

    });

});

// Route to create a ticket:
app.post('/createticketbyform/', (req, res) => {

    // ticket info
    const ticket = req.body;
    console.log(ticket);

    // mongo
    const client = new MongoClient(uri);


    if( ticket.id &&
        ticket.created_at &&
        ticket.type &&
        ticket.subject &&
        ticket.description &&
        ticket.priority &&
        ticket.status &&
        ticket.recipient &&
        ticket.submitter &&
        ticket.assignee_id &&
        ticket.follower_ids &&
        ticket.tags)
    {

        async function run() {

            try {
    
                const db = client.db('Tickets');
                const collection = db.collection('TicketList');

                // cast certain properties of ticket to number instead of string
                ticket.id = Number(ticket.id);
                ticket.assignee_id = Number(ticket.assignee_id);
                ticket.follower_ids = Number(ticket.follower_ids);

                collection.insertOne(ticket, function (err, data) {

                    if (err) {
                        console.log(err);
                        throw err;
                    } else {
                        console.log(data);
                        db.close();
                    }

                });
    
            } catch (e) {
                console.log(e);
                res.send(e);
            } finally {
                await client.close();
            }
    
        }

        run().catch(console.dir);
        res.send("Ticket succesfully created");

    } else {
        console.log("Ticket creation failed: empty fields.")
        res.send("Ticket creation failed.\nFields cannot be empty");
    }

});

// Route to edit a ticket with specified ID:
app.put('/rest/ticket/:id', (req, res) => {

    // ticket info
    var ticketID = Number(req.params.id);
    var ticket = req.body;

    // mongo
    const client = new MongoClient(uri);

    async function run() {

        try {

            const db = client.db('Tickets');
            const collection = db.collection('TicketList');

            await collection.updateOne( { id: ticketID }, {

                // everything except 'id', 'submitter', and 'created_at' can be changed
                $set:
                {
                    "updated_at": ticket.update_at,
                    "type": ticket.type,
                    "subject": ticket.subject,
                    "description": ticket.description,
                    "priority": ticket.priority,
                    "status": ticket.status,
                    "recipient": ticket.recipient,
                    "assignee_id": ticket.assignee_id,
                    "follower_ids": ticket.follower_ids,
                    "tags": ticket.tags
                }

                }, function (err, data) {

                if(err) {
                    res.send(err);
                    console.log(err);
                } else {
                    console.log(data);
                    db.close();
                }

            });

        } catch(e) {
            console.log(e);
        } finally {
            res.send();
        }

    }

    run().catch(console.dir);

});

// Route to delete a ticket with specified ID:
app.delete('/rest/ticket/:id', (req, res) => {

    // ticket info
    const ticketID = Number(req.params.id);

    // mongo
    const client = new MongoClient(uri);

    async function run() {

        try {

            const db = client.db('Tickets');
            const collection = db.collection('TicketList');

            collection.deleteOne({ id: ticketID }, function (err, data) {

                if (err) {
                    console.log(err);
                    throw err;
                } else {
                    console.log(err);
                    db.close();
                }

            });

        } catch (e) {
            console.log(e);
        } finally {
            console.log("delete");
            res.send("delete");
            await client.close();
        }

    }

    run().catch(console.dir);

});