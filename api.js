/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
let mongodb = require('mongodb');
let mongoose = require('mongoose');
mongoose.set('strictQuery', true);
//const ObjectId = require('mongoose').Types.ObjectId
let bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  comments: { type: [] }
});

const Book = mongoose.model('personal_library', bookSchema, 'books');

mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

const ObjectId = mongoose.Types.ObjectId;

module.exports = function(app) {

  app.route('/api/books')
    .get(async function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let bookArray = []

      const booksFound = await Book.find({});

      if (booksFound) {
        booksFound.forEach((result) => {
          let book = result.toJSON()
          book['commentcount'] = book.comments.length
          bookArray.push(book)
        })
        return res.json(bookArray);
      }
    })

    .post(async function(req, res) {
      //response will contain new book object including atleast _id and title
      let title = req.body.title;
      try {

        if (!title) {
          return res.send("missing required field title")
        };

        const newBook = new Book({
          title: title,
          comments: []
        });
        const savedBook = await newBook.save();
    
        return res.json(savedBook);         
      
      } catch (err) {
        console.error(err);
        res.status(200).send(err);
      }
    })

    .delete(async function(req, res) {
      try {
        //if successful response will be 'complete delete successful'
        const deleteAllBooks = await Book.deleteMany({});
        return res.send('complete delete successful');

      } catch (err) {
        console.error(err);
        res.status(200).send(err);
      }
    });




  app.route('/api/books/:id')
    .get(async function(req, res) {
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      let bookid = req.params.id;
      try {
        //bookid = mongoose.Types.ObjectId(bookid)

        const singleBook = await Book.findById(bookid);

        if (singleBook) {
          return res.json(singleBook);
        } else {
          return res.send('no book exists')
        }
      } catch (err) {
        console.error(err);
        res.status(200).send(err);
      }
    })

    .post(async function(req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;
      try {
        //json res format same as .get
        if (!comment) {
          return res.send('missing required field comment')
        }

        //mongoose.Types.ObjectId(bookid)

        const bookUpdated = await Book.findByIdAndUpdate(bookid, { $push: { comments: comment } }, { new: true });

        if (!bookUpdated) {
          return res.send('no book exists')
        } else {
          return res.json(bookUpdated)
        }
      } catch (err) {
        console.error(err);
        res.status(200).send(err);
      }
    })

    .delete(async function(req, res) {
      let bookid = req.params.id;
      try {
        //mongoose.Types.ObjectId(bookid)
        //if successful response will be 'delete successful'
        const deleteBook = await Book.findByIdAndDelete(bookid);

        if (!deleteBook) {
          return res.send('no book exists')
        } else {
          return res.send('delete successful')
        }
      } catch (err) {
        console.error(err)
        res.status(200).send(err)
      }
    });
};
