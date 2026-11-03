"""FastAPI entrypoint for the dashboard app.

The reusable base-app layer — platform routes (connector/MCP data access, the
embedded agent assistant), live-reload, SPA serving, and the env-based security
model — lives in platform_app.py so it can be shared across app types. This
module just creates the app via create_app().

To add DASHBOARD-specific server routes, pass a register_extra callback so they
land before the SPA catch-all, e.g.:

    from fastapi import FastAPI
    def register_dashboard_routes(app: FastAPI) -> None:
        @app.get("/api/whatever")
        async def whatever():
            ...
    app = create_app(register_dashboard_routes)

Today the dashboard's UI is fully client-side, so there are none.
"""
from platform_app import create_app

app = create_app()
