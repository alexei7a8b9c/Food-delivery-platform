DELETE FROM user_role;

INSERT INTO user_role (user_id, role_id) VALUES
                                             (1, 3), -- Admin User - ADMIN
                                             (2, 1), -- John Doe - USER
                                             (3, 1), -- Jane Smith - USER
                                             (3, 2), -- Jane Smith - MANAGER
                                             (4, 1), -- Mike Wilson - USER
                                             (5, 1), -- Sarah Johnson - USER
                                             (6, 1), -- Lisa Davis - USER
                                             (6, 3); -- Lisa Davis - ADMIN