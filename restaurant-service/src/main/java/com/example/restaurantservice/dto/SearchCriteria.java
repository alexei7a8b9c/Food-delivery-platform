package com.example.restaurantservice.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SearchCriteria {
    private String searchTerm;
    private String cuisine;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String sortBy = "id";
    private String sortDirection = "asc";
    private int page = 0;
    private int size = 10;
}