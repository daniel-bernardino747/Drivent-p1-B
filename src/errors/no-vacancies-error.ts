import { ApplicationError } from "./../protocols";

export function noVacanciesAvailableError(): ApplicationError {
  return {
    name: "NoVacanciesAvailableError",
    message: "No vacancies available at the moment.",
  };
}
