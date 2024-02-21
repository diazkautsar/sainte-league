import axios from "axios";
import {
  calegDprdKabKotLebakDapil2,
  partai,
  calegDprRiDapilJakarta1,
  calegDprRiDapilJabar8,
  calegDprdProvJabarDapil12,
  calegDprdKabCirebonDapil1,
  calegDprdKabCirebonDapil4,
  calegDprdKabLebakDapil5,
} from './data'

// import { vote, nationalVoteParty } from './dummy'

async function checkPT (nationalVoteParty: { [K: string]: number }, partyNumber: string): Promise<boolean> {
  let totalSuara: number = 0
  Object.keys(nationalVoteParty).forEach(item => {
    totalSuara += nationalVoteParty[item]
  })
  const partyPercentage: number = Number(((nationalVoteParty[partyNumber] / totalSuara ) * 100).toFixed(2))
  
  if ( partyPercentage >= 4 ) {
    return true
  } else {
    return false
  }
}

async function resultVote({
  seats,
  urlVoteResult,
  urlGetSuaraPartaiNasional,
  caption,
  usePT,
  caleg
}: {
  seats: number,
  urlVoteResult: string,
  urlGetSuaraPartaiNasional: string,
  caption: string;
  usePT?: boolean;
  caleg: any;
}) {
  try {
    const [
      { data: vote },
      { data: nationalVoteParty },
    ] = await Promise.all([
      axios.get(urlVoteResult),
      axios.get(urlGetSuaraPartaiNasional)
    ])

    const elections: { [K: string]: { jml_suara_total: number, divider: number } } = {}
    Object.keys(vote.table).forEach(item => {
      elections[item] = {
        jml_suara_total: vote.table[item].jml_suara_total,
        divider: 1 as number
      }
      delete vote.table[item].jml_suara_total
      delete vote.table[item].jml_suara_partai
    })

    if (usePT) {
      await Promise.all(Object.keys(elections).map(async (item) => {
        const passedPt = await checkPT(nationalVoteParty.chart, item)

        if (!passedPt) {
          delete elections[item]
        }
      }))
    }

    const results: { partai: string, nomer_urut_partai: number, caleg: string[] }[] = []
    for (let i = 0; i < seats; i++) {
      let highestVote: number = 0;
      let partySelected: string = "";
      Object.keys(elections).forEach(party => {
        const votes = elections[party].jml_suara_total;
        const divided = elections[party].divider;
        const quotient = votes / divided;
        if (quotient > highestVote) {
          highestVote = quotient;
          partySelected = party;
        }
      });
      elections[partySelected].divider += 2;
      elections[partySelected].jml_suara_total = highestVote

      let maxPersonVote: number = 0
      let personSelected: string = ''
      Object.keys(vote.table[partySelected]).forEach(item => {
        const total = vote.table[partySelected][item]
        if (total > maxPersonVote) {
          maxPersonVote = total
          personSelected = item
        }
      })

      const listCaleg = caleg[partySelected]
      const calegName = listCaleg[personSelected].nama

      const findExistingParty = results.findIndex(item => Number(partySelected) === item.nomer_urut_partai)
      if (findExistingParty >= 0) {
        results[findExistingParty].caleg.push(calegName)
      } else {
        const partaiData = partai[partySelected]
        results.push({
          partai: partaiData.nama_lengkap,
          nomer_urut_partai: partaiData.nomor_urut,
          caleg: [
            calegName
          ]
        })
      }

      delete caleg[partySelected][personSelected]
      delete vote.table[partySelected][personSelected]
    }
    
    console.log(caption, results)
  } catch (error) {
    console.log(error)
  } 
}

( async () => {
  const urlGetSuaraPartaiNasional: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdpr/0.json"

  /**
   * KABUPATEN
   */
  // kabupaten lebak dapil 2
  // const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdprdk/36/3602/360202.json"
  // const seats: number = 8
  // const usePT: boolean = false
  // const caption: string= "Perkiraan kursi DPRD Kabupaten Lebak Dapil 2 sebagai berikut"
  // const caleg = 

  // kabupaten lebak dapil 5
  // const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdprdk/36/3602/360205.json"
  // const seats: number = 7
  // const usePT: boolean = false
  // const caption: string= "Perkiraan kursi DPRD Kabupaten Lebak Dapil 5 jumlah kursi 7, sebagai berikut"
  // const caleg = calegDprdKabLebakDapil5

  // kabupaten cirebon - jabar dapil 1
  // const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdprdk/32/3209/320901.json"
  // const seats: number = 8
  // const usePT: boolean = false
  // const caption: string= "Perkiraan kursi DPRD Kabupaten Cirebon Dapil 1, dengan jumlah kursi 8, sebagai berikut: "
  // const caleg = calegDprdKabCirebonDapil1

  // kabupaten cirebon - jabar dapil 4
  // const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdprdk/32/3209/320904.json"
  // const seats: number = 8
  // const usePT: boolean = false
  // const caption: string= "Perkiraan kursi DPRD Kabupaten Cirebon Dapil 4, dengan jumlah kursi 8, sebagai berikut: "
  // const caleg = calegDprdKabCirebonDapil4
  
  /**
   * NASIONAL
   */

  // DPR RI DKI Jakarta 1
  // const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdpr/3101.json"
  // const seats: number = 6
  // const usePT: boolean = true
  // const caption: string = "Perkiraan kursi DPR RI Dapil Jakarta 1. Jumlah Kursi 6: "
  // const caleg = calegDprRiDapilJakarta1

  // DPR RI Jabar 8
  // const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdpr/3208.json"
  // const seats: number = 9
  // const usePT: boolean = true
  // const caption: string = "Perkiraan kursi DPR RI Dapil Jabar 8. Jumlah Kursi 9: "
  // const caleg = calegDprRiDapilJabar8

  // DPR RI Jabar 8
  const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdpr/3601.json"
  const seats: number = 6
  const usePT: boolean = true
  const caption: string = "Perkiraan kursi DPR RI Dapil Banten 1. Jumlah Kursi 9: "
  const caleg = calegDprRiDapilJabar8

  /**
   * PROVINSI
   */
  // const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdprdp/32/320012.json"
  // const seats: number = 12
  // const usePT: boolean = false
  // const caption: string = "Perkiraan kursi DPRD Jabar dapil 12. Jumlah Kursi 12: "
  // const caleg = calegDprdProvJabarDapil12

  await resultVote({
    seats,
    urlVoteResult,
    urlGetSuaraPartaiNasional,
    caption,
    usePT,
    caleg,
  })
  process.exit(1)
})()



// console.log("Hasil kursi yang dialokasikan:", result);
