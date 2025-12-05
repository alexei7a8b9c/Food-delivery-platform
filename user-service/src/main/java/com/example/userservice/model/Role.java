package com.example.userservice.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "roles")  // Должно совпадать с именем таблицы в SQL
@Data
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name;
}