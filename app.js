const { ObjectId } = require('bson');
const express = require('express');
const { object } = require('webidl-conversions');
const { getDb, connectToDb } = require('./db')

// unit App & middleware
const app = express()
app.use(express.json())
//db connection 
let db;

connectToDb((err) => {
    if (!err) {
        app.listen('3000', () => {
            console.log('app listening on port 3000')
        })
        db = getDb()
    }
})

// routes
app.get('/books', (req, res) => {
    let books = []
    const pages = req.query.p || 0
    const booksPerPages = 3

    db.collection('books')
        .find()
        .sort({ author: 1 })
        .skip(pages * booksPerPages) // Skipp
        .limit(booksPerPages)       // Limit
        .forEach(book => books.push(book))
        .then(() => {
            res.status(200).json(books)
        })
        .catch(() => {
            res.status(200).json(books)
        })
        .catch(() => {
            res.status(500).json({ error: 'could not fetch the documents ' })
        })
})

app.get('/books/:id', (req, res) => {
    if (ObjectId.isValid(req.params.id)) {

        db.collection('books')
            .findOne({ _id: ObjectId(req.params.id) })
            .then(doc => {
                res.status(200).json(doc)
            })
            .catch(err => {
                res.status(500).json({ error: 'could not fetch the document' })
            })
    } else {
        res.status(500).json({ error: 'not a valid  document id' })
    }

})

app.post('/books', (req, res) => {
    const book = req.body
    db.collection('books')
        .insertOne(book)
        .then(result => {
            res.status(201).json(result)
        })
        .catch(err => {
            res.status(500).json({ err: 'could not create a new document' })
        })
})

app.delete('/books/:id', (req, res) => {

    if (ObjectId.isValid(req.params.id)) {
        db.collection('books')
            .deleteOne({ _id: ObjectId(req.params.id) })
            .then(result => {
                res.status(200).json(result)
            })
            .catch(err => {
                res.status(500).json({ error: 'could not delete the document' })
            })
    } else {
        res.status(500).json({ error: 'not a valid  document id' })
    }
})

app.patch('/books/:id', (req, res) => {
    const updates = req.body

    if (ObjectId.isValid(req.params.id)) {
        db.collection('books')
            .updateOne({ _id: ObjectId(req.params.id) }, { $set: updates })
            .then(result => {
                res.status(200).json(result)
            })
            .catch(err => {
                res.status(500).json({ error: 'could not update the document' })
            })
    } else {
        res.status(500).json({ error: 'not a valid  document id' })
    }
})