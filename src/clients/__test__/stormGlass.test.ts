import StormGlass from '@src/clients/stormGlass';
import * as HTTPUtil from '@src/utils/request';
import stormGlassWheather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json'

jest.mock('@src/utils/request');

describe('StormGlass Client', () => {

  const mockedRequestClass = HTTPUtil.Request as jest.Mocked<typeof HTTPUtil.Request>
  //atribui os tipos do jest e do axios ao mock
  const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;

  test('Deve retornar a previsão normalizada do serviço StormGlass', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    
    mockedRequest.get.mockResolvedValue({data:stormGlassWheather3HoursFixture} as HTTPUtil.Response);

    const stormGlass = new StormGlass(mockedRequest);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual(stormGlassNormalized3HoursFixture);
  });

  test('Deve excluir pontos de dados incompletos', async () => {
    const lat = -33.792726;
    const lng = 151.289824;
    const incompleteResponse = 
    {
      hours:
      [
        {
          windDirection:
          {
            noaa: 300,
          },
          time: '2020-04-26T00:00:00+00:00',
        },
      ]
    }
    
    mockedRequest.get.mockResolvedValue({data:incompleteResponse} as HTTPUtil.Response);

    const stormGlass = new StormGlass(mockedRequest);
    const response = await stormGlass.fetchPoints(lat, lng);

    expect(response).toEqual([]);
  });

  test('Deve receber um erro genérico do serviço StormGlass quando a solicitação falha antes de chegar ao serviço', async () => {
    const lat = -33.792726;
    const lng = 151.289824;

    mockedRequest.get.mockRejectedValue({ message: 'Network Error' });

    const stormGlass = new StormGlass(mockedRequest);

    await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
      'Unexpected error when trying to communicate to StormGlass: Network Error'
    );
  });

  test('Deve obter um StormGlassResponseError quando o serviço StormGlass responder com erro', 
    async () => 
    {
      const lat = -33.792726;
      const lng = 151.289824;

      mockedRequestClass.isRequestError.mockReturnValue(true);
      class FakeAxiosError extends Error {
        constructor(public response: object) {
          super();
        }
      }

      mockedRequest.get.mockRejectedValue(
        new FakeAxiosError({
          status: 429,
          data: { errors: ['Rate Limit reached'] },
        })
      );

      const stormGlass = new StormGlass(mockedRequest);

      await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
        'Unexpected error returned by the StormGlass service: Error: {"errors":["Rate Limit reached"]} Code: 429'
      );
    }
  );
});
