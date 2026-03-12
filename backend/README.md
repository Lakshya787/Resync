controllers/
├── auth.controller.js
├── goal.controller.js
├── step.controller.js
├── project.controller.js
├── ai.controller.js
├── dashboard.controller.js

services/+
├── goal.service.js
├── step.service.js
├── ai.service.js
├── project.service.js

middlewares/
├── auth.middleware.js
├── error.middleware.js


/api/v1
├── auth
│   ├── register
│   ├── login
│   ├── logout
│   └── check
│
├── goals
│   ├── GET /
│   ├── POST /select
│   ├── GET /active
│   └── PATCH /pause
│
├── steps
│   ├── GET /active
│   └── POST /complete
│
├── projects
│   ├── POST /submit
│   └── GET /history
│
├── ai
│   └── POST /mentor
│
└── dashboard
    └── GET /
