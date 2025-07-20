Online web store platform based on microservice programming with Node.js + Express + TypeScript connected via MongoDB and Redis + ElasticSearch.

Introduction:

Full structure diagram:

[Client] → [API Gateway] → [User/Product/Order/Payment Services]
                                  ↓
                           [Redis, MongoDB, ES]
                                  ↓
                        [Notification Service]

---------------------------------------------------------------------------

این پروژه:
پلتفرم فروشگاه آنلاین با معماری میکروسرویس که شامل مدیریت کاربران، محصولات، سفارشات و پرداخت می‌باشد.


 میکروسرویس‌ها:
1. User Service (مدیریت کاربران)
2. Product Service (مدیریت محصولات)
3. Order Service (مدیریت سفارشات)
4. Payment Service (پرداخت)
5. Notification Service (اعلان‌رسانی)
6. API Gateway (دروازه ورودی)
