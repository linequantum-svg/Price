# Firebase Setup

Цей проєкт уже підготовлений до окремої адмінки для перемикання статусу:

- `В наявності`
- `Немає в наявності`

Сторінка адмінки: `admin.html`

## Що вже зроблено

- Додано модуль `stock-sync.js`, який підтягує override-статуси з Firestore.
- Каталогові сторінки перед першим рендером синхронізують наявність з Firebase.
- Додано `admin.html` + `admin.js` для входу через Firebase Auth і зміни статусу товарів.
- Додано `firebase-config.js`, куди потрібно вставити конфіг твого Firebase-проєкту.

## 1. Створи Firebase-проєкт

1. Відкрий [Firebase Console](https://console.firebase.google.com/).
2. Створи новий проєкт.
3. Додай Web App.
4. Скопіюй web config.

## 2. Заповни конфіг у файлі

Відкрий [firebase-config.js](/E:/ChatGPT/Price-git/firebase-config.js:1) і встав свої значення:

```js
export const firebaseStockConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  appId: "YOUR_APP_ID"
};
```

## 3. Увімкни Authentication

У Firebase Console:

1. `Build -> Authentication`
2. `Get started`
3. Увімкни метод `Email/Password`
4. Створи користувача в розділі `Users`

Саме цим логіном ти будеш заходити в `admin.html`.

## 4. Створи Firestore Database

У Firebase Console:

1. `Build -> Firestore Database`
2. `Create database`
3. Обери production mode або test mode
4. Після створення задай правила доступу

## 5. Додай правила Firestore

Для цього сценарію підійдуть такі правила:

```txt
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /stockStatuses/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Це означає:

- сайт може читати статуси без логіна
- змінювати статуси можуть лише авторизовані користувачі

## 6. Як це працює

- Базовий статус товару лишається у локальних масивах `data.js`, `*-data.js`
- Якщо у Firestore є документ для товару, він має пріоритет
- Ключ товару генерується автоматично з `category + name`
- Адмінка зберігає статус в колекцію `stockStatuses`

## 7. Як користуватись

1. Відкрий `admin.html`
2. Увійди через email/password з Firebase Auth
3. Знайди товар
4. Перемкни статус
5. Онови сторінку каталогу

## 8. Що побачать відвідувачі

Після зміни статусу в адмінці:

- у каталозі буде показано актуальний статус з Firestore
- локальні файли товарів при цьому можна не редагувати

## Важливе

- `firebase-config.js` містить публічний web config, це нормально для Firebase Web Apps
- безпечність тут забезпечують саме правила Firestore і логін через Firebase Auth
- якщо `firebase-config.js` порожній, сайт просто продовжить працювати на локальних статусах з файлів
