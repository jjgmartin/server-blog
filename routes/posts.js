const express = require('express')
const router = express.Router()
const Post = require('../models/Post')
const Comment = require('../models/Comment')

// Rutas

// GET
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
        res.status(200).json(posts)
    } catch (error) {
        res.status(500).json({ message: error.message})
    }
})



// POST
router.post('/', async (req, res) => {

    const post = new Post({
        title: req.body.title,
        content: req.body.content,
        extract: req.body.extract,
        authorName: req.body.authorName,
        authorEmail: req.body.authorEmail,
    })

    try {
        const newPost = await post.save()
        res.status(201).json(newPost)
    } catch (error) {
        res.status(400).json({ message: error.message})
    }
})

router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id
        const post = await Post.findById(id)
        if(!post) {
            return res.status(404).json({ message: 'Post not found' })
        }

        res.status(200).json(post)
    } catch (error) {
        res.status(500).json({ message: error.message})
    }
})

// DELETE - Eliminar un post y sus comentarios asociados
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        // Buscamos y eliminamos el post
        const post = await Post.findByIdAndDelete(id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Eliminamos los comentarios asociados a este post
        await Comment.deleteMany({ _id: { $in: post.comments } });

        // Respuesta indicando que el post y los comentarios fueron eliminados
        res.status(200).json({ message: 'Post and associated comments deleted successfully', post });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// PUT - Actualizar un Post existente
router.put('/:id', async (req, res) => {
    const id = req.params.id;
    const { title, content, authorName, authorEmail } = req.body;

    try {
        // Buscamos el post por su ID y actualizamos con los nuevos datos
        const updatedPost = await Post.findByIdAndUpdate(
            id, // ID del post que queremos actualizar
            {
                title: title,
                content: content,
                authorName: authorName,
                authorEmail: authorEmail,
            },
            { new: true } // Esto nos devuelve el post actualizado
        );

        // Si no encontramos el post, devolvemos un 404
        if (!updatedPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Devolvemos el post actualizado
        res.status(200).json(updatedPost);
    } catch (error) {
        // Si ocurre algún error, devolvemos un 500 con el mensaje del error
        res.status(500).json({ message: error.message });
    }
});


// COMMENTS COMMENTS

//get

router.get('/:id/comments', async (req, res) => {
    let post
    try {
        post = await Post.findById(req.params.id).populate('comments')
        if(!post) {
            return res.status(404).json({ message: 'Post not found' })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

    res.json(post.comments)
})

//post

router.post('/:id/comments', async (req, res) => {
    let post
    try {
        post = await Post.findById(req.params.id)
        if(!post) {
            return res.status(404).json({ message: 'Post not found' })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

    const comment = new Comment({
        authorName: req.body.authorName,
        authorEmail: req.body.authorEmail,
        content: req.body.content,
    })

    try {
        const newComment = await comment.save()
        post.comments.push(newComment._id)
        await post.save()
        res.status(201).json(newComment)
    } catch (error) {
        res.status(400).json({ message: error.message})
    }
})

// delete

router.delete('/:id/comments/:commentId', async (req, res) => {
    let post
    try {
        post = await Post.findById(req.params.id)
        if(!post) {
            return res.status(404).json({ message: 'Post not found' })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

    let comment
    try {
        const commentId = req.params.commentId
        comment = await Comment.findByIdAndDelete(commentId)
        if(!comment) {
            return res.status(404).json({ message: 'Comment not found' })
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

    try {
        post.comments = post.comments.filter(commentId => commentId.toString() !== req.params.commentId)
        await post.save()
        res.status(200).json({ message: 'Comment deleted' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})


// PUT - Actualizar un comentario existente
router.put('/:id/comments/:commentId', async (req, res) => {
    let post;
    try {
        // Buscamos el post al que pertenece el comentario
        post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ message: 'Post not found' })
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    let comment;
    try {
        // Buscamos el comentario por su ID y actualizamos con los nuevos datos
        const { commentId } = req.params;
        const { authorName, authorEmail, content } = req.body;

        comment = await Comment.findByIdAndUpdate(
            commentId,
            {
                authorName: authorName,
                authorEmail: authorEmail,
                content: content,
            },
            { new: true } // Devuelve el comentario actualizado
        );

        // Si no encontramos el comentario, devolvemos un 404
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Devolvemos el comentario actualizado
        res.status(200).json(comment);
    } catch (error) {
        // Si ocurre algún error, devolvemos un 500 con el mensaje del error
        res.status(500).json({ message: error.message });
    }
});



module.exports = router