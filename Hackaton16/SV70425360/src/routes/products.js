const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/authMiddleware');
const productController = require('../controllers/productController');

// Lista de productos públicos (no requiere login)
router.get('/', productController.list);

// En un entorno real, estas rutas serían solo para admin
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.remove);

module.exports = router;
