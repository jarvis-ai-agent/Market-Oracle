"""
Modal client for calling TimesFM inference from the FastAPI backend.
Tokens are set via MODAL_TOKEN_ID and MODAL_TOKEN_SECRET in backend/.env
"""
import os


def get_forecast(rv_series: list, horizon: int = 5) -> dict | None:
    """
    Call the deployed Modal TimesFM function.
    Returns None on failure — backend falls back to mock forecast.
    """
    token_id = os.getenv("MODAL_TOKEN_ID")
    token_secret = os.getenv("MODAL_TOKEN_SECRET")

    if not token_id or not token_secret:
        return None

    try:
        import modal
        os.environ["MODAL_TOKEN_ID"] = token_id
        os.environ["MODAL_TOKEN_SECRET"] = token_secret

        forecast_fn = modal.Function.from_name("market-oracle-timesfm", "forecast_volatility")
        result = forecast_fn.remote(rv_series, horizon=horizon)
        return result
    except Exception as e:
        print(f"[Modal/TimesFM] Inference failed: {e}")
        return None
