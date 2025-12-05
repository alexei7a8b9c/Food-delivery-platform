import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer style={styles.footer}>
            <div style={styles.container}>
                <div style={styles.footerContent}>
                    <div style={styles.footerSection}>
                        <h3 style={styles.sectionTitle}>Food Delivery</h3>
                        <p style={styles.sectionText}>
                            Лучший сервис доставки еды в вашем городе.
                            Заказывайте вкусную еду из любимых ресторанов прямо к вам домой или в офис.
                        </p>
                        <div style={styles.socialIcons}>
                            <a href="#" style={styles.socialIcon}><FaFacebook /></a>
                            <a href="#" style={styles.socialIcon}><FaTwitter /></a>
                            <a href="#" style={styles.socialIcon}><FaInstagram /></a>
                            <a href="#" style={styles.socialIcon}><FaLinkedin /></a>
                        </div>
                    </div>

                    <div style={styles.footerSection}>
                        <h3 style={styles.sectionTitle}>Контакты</h3>
                        <div style={styles.contactInfo}>
                            <div style={styles.contactItem}>
                                <FaPhone style={styles.contactIcon} />
                                <span>+7 (999) 123-45-67</span>
                            </div>
                            <div style={styles.contactItem}>
                                <FaEnvelope style={styles.contactIcon} />
                                <span>info@fooddelivery.ru</span>
                            </div>
                            <div style={styles.contactItem}>
                                <FaMapMarkerAlt style={styles.contactIcon} />
                                <span>Москва, ул. Примерная, д. 123</span>
                            </div>
                        </div>
                    </div>

                    <div style={styles.footerSection}>
                        <h3 style={styles.sectionTitle}>Быстрые ссылки</h3>
                        <ul style={styles.linkList}>
                            <li><a href="/" style={styles.footerLink}>Главная</a></li>
                            <li><a href="/restaurants" style={styles.footerLink}>Рестораны</a></li>
                            <li><a href="/menu" style={styles.footerLink}>Меню</a></li>
                            <li><a href="/cart" style={styles.footerLink}>Корзина</a></li>
                            <li><a href="/orders" style={styles.footerLink}>Заказы</a></li>
                        </ul>
                    </div>

                    <div style={styles.footerSection}>
                        <h3 style={styles.sectionTitle}>Рабочее время</h3>
                        <div style={styles.workingHours}>
                            <p>Пн-Пт: 9:00 - 23:00</p>
                            <p>Сб-Вс: 10:00 - 00:00</p>
                            <p style={styles.note}>Доставка осуществляется круглосуточно</p>
                        </div>
                    </div>
                </div>

                <div style={styles.footerBottom}>
                    <p style={styles.copyright}>
                        © {new Date().getFullYear()} Food Delivery Platform. Все права защищены.
                    </p>
                    <div style={styles.footerLinks}>
                        <a href="/privacy" style={styles.bottomLink}>Политика конфиденциальности</a>
                        <a href="/terms" style={styles.bottomLink}>Условия использования</a>
                        <a href="/sitemap" style={styles.bottomLink}>Карта сайта</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

const styles = {
    footer: {
        backgroundColor: '#2c3e50',
        color: '#ecf0f1',
        padding: '40px 0 20px',
        marginTop: 'auto',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
    },
    footerContent: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '30px',
        marginBottom: '40px',
    },
    footerSection: {
        padding: '0 15px',
    },
    sectionTitle: {
        color: '#fff',
        fontSize: '1.2rem',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '2px solid #ff6b35',
    },
    sectionText: {
        lineHeight: '1.6',
        marginBottom: '20px',
        fontSize: '0.95rem',
    },
    socialIcons: {
        display: 'flex',
        gap: '15px',
    },
    socialIcon: {
        color: '#ecf0f1',
        fontSize: '1.2rem',
        transition: 'color 0.3s ease',
        textDecoration: 'none',
        ':hover': {
            color: '#ff6b35',
        },
    },
    contactInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    contactItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.95rem',
    },
    contactIcon: {
        color: '#ff6b35',
        fontSize: '1rem',
    },
    linkList: {
        listStyle: 'none',
        padding: 0,
    },
    footerLink: {
        color: '#ecf0f1',
        textDecoration: 'none',
        display: 'block',
        padding: '5px 0',
        transition: 'all 0.3s ease',
        fontSize: '0.95rem',
        ':hover': {
            color: '#ff6b35',
            paddingLeft: '5px',
        },
    },
    workingHours: {
        fontSize: '0.95rem',
        lineHeight: '1.8',
    },
    note: {
        fontSize: '0.85rem',
        color: '#95a5a6',
        fontStyle: 'italic',
        marginTop: '10px',
    },
    footerBottom: {
        borderTop: '1px solid #34495e',
        paddingTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        '@media (min-width: 768px)': {
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
    },
    copyright: {
        fontSize: '0.9rem',
        color: '#95a5a6',
        textAlign: 'center',
    },
    footerLinks: {
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    bottomLink: {
        color: '#ecf0f1',
        textDecoration: 'none',
        fontSize: '0.85rem',
        transition: 'color 0.3s ease',
        ':hover': {
            color: '#ff6b35',
        },
    },
};

export default Footer;