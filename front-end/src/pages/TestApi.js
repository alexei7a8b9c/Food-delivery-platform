import React, { useState } from 'react';
import { restaurantService } from '../services/restaurantService';
import '../styles/common.css';

const TestApi = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const testRestaurantsApi = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await restaurantService.getAllRestaurants();
            setResult({
                endpoint: '/api/restaurants',
                data: data,
                count: data.length
            });
        } catch (err) {
            setError(`Error: ${err.message}`);
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    const testDishesApi = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await restaurantService.getAllDishes();
            setResult({
                endpoint: '/api/menu/dishes',
                data: data,
                count: data.length
            });
        } catch (err) {
            setError(`Error: ${err.message}`);
            setResult(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>API Тестирование</h1>

            <div className="test-buttons">
                <button
                    onClick={testRestaurantsApi}
                    className="btn btn-primary"
                    disabled={loading}
                >
                    Тест /api/restaurants
                </button>

                <button
                    onClick={testDishesApi}
                    className="btn btn-secondary"
                    disabled={loading}
                >
                    Тест /api/menu/dishes
                </button>
            </div>

            {loading && (
                <div className="loading">
                    <p>Загрузка...</p>
                </div>
            )}

            {error && (
                <div className="error">
                    <h3>Ошибка:</h3>
                    <p>{error}</p>
                </div>
            )}

            {result && (
                <div className="result">
                    <h3>Результат запроса к {result.endpoint}:</h3>
                    <p>Найдено записей: {result.count}</p>
                    <div className="data-preview">
                        <pre>{JSON.stringify(result.data.slice(0, 3), null, 2)}</pre>
                        {result.data.length > 3 && <p>...и еще {result.data.length - 3} записей</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestApi;