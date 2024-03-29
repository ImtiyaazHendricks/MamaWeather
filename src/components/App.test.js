import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import App from "./App";

describe("<App />", () => {
  beforeAll(() => {
    process.env.REACT_APP_API_URL = "https://api.openweathermap.org/data/2.5";
    process.env.REACT_APP_API_KEY = "some-api-key";
  });
  beforeEach(() => jest.spyOn(window, "fetch"));
  afterEach(() => jest.restoreAllMocks());

  test("fetches and then renders the current weather and forecast", async () => {
    window.fetch
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockWeatherData)
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockForecastData)
        })
      );

    render(<App />);

    expect(
      screen.getByText("Thursday, 1:24 PM, Broken Clouds")
    ).toBeInTheDocument();
    expect(screen.getByText("20°C")).toBeInTheDocument();
    expect(screen.getByText(/30\s+km\/h Winds/)).toBeInTheDocument();
    expect(screen.getByText(/49% Humidity/)).toBeInTheDocument();
    expect(
      screen.getByText("'Netflix and chill' weather. It's pleasant outside")
    ).toBeInTheDocument();
    expect(screen.getByText("Saturday")).toBeInTheDocument();
    expect(screen.getByText("Sunday")).toBeInTheDocument();
    expect(screen.getByText("Monday")).toBeInTheDocument();
    expect(screen.getByText("Tuesday")).toBeInTheDocument();
    expect(window.fetch).toHaveBeenCalledTimes(2);
    expect(window.fetch).toHaveBeenCalledWith(
      "https://api.openweathermap.org/data/2.5/weather/?q=Cape Town&units=metric&APPID=some-api-key"
    );
    expect(window.fetch).toHaveBeenCalledWith(
      "https://api.openweathermap.org/data/2.5/forecast/?q=Cape Town&units=metric&APPID=some-api-key"
    );
  });

  test("renders loading spinner & an error if there's a problem getting weather data", async () => {
    const mockErrorResponse = {
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      message: "An internal server error occurred"
    };

    window.fetch.mockImplementationOnce(() =>
      Promise.reject(mockErrorResponse)
    );

    render(<App />);

    // loading spinner
    await screen.findByRole("progressbar");
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByText(mockErrorResponse.message)).toBeInTheDocument();
  });
});
