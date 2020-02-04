import fetch from 'node-fetch'
// const postJson = async (url: string, obj: object): Promise<any> => {
//   const resp = await fetch(url, {
//     body: JSON.stringify(obj),
//     headers: { 'Content-Type': 'application/json' },
//     method: 'post'
//   })

//   return resp.json()
// }

export const postAndGetBodyAsJSON = async (url: string, obj: object): Promise<any> => {
  const resp = await fetch(url, {
    body: JSON.stringify(obj),
    headers: { 'Content-Type': 'application/json' },
    method: 'post'
  })

  return resp.json()
}
