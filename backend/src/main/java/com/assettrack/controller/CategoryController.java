package com.assettrack.controller;

import com.assettrack.entity.AssetCategory;
import com.assettrack.repository.AssetCategoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {

    private final AssetCategoryRepository categoryRepository;

    public CategoryController(AssetCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<AssetCategory>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetCategory> getCategoryById(@PathVariable String id) {
        return categoryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AssetCategory> createCategory(@RequestBody AssetCategory category) {
        AssetCategory saved = categoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
