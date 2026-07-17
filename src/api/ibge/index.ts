import axios from "axios"
import type { IbgeState } from "./types"

export const IbgeApi = {
  async getState(): Promise<IbgeState[]> {
    const { data } = await axios.get("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
    return data;
  },

  async getCitiesFromState(stateId: string): Promise<IbgeState[]> {
    const { data } = await axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios?orderBy=nome`)
    return data;
  }
}
