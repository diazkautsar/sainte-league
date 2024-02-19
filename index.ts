import axios from "axios";
import { calegDprdKabKotLebakDapil2, partai } from './data'

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

  // kabupaten lebak dapil 2
  const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdprdk/36/3602/360202.json"
  const seats: number = 8
  const usePT: boolean = false
  const caption: string= "Perkiraan kursi DPRD Kabupaten Lebak Dapil 2 sebagai berikut"
  const caleg = calegDprdKabKotLebakDapil2

  // DPR RI DKI Jakarta 1
  // const urlGetCaleg: string = "https://sirekap-obj-data.kpu.go.id/pemilu/caleg/partai/3101.json"
  // const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdpr/3101.json"
  // const seats: number = 6
  // const usePT: boolean = true
  // const caption: string = "Perkiraan kursi DPR RI Dapil Jakarta 1. Jumlah Kursi 6: "

  // DPR RI DKI Jakarta 2
  // const urlGetCaleg: string = "https://sirekap-obj-data.kpu.go.id/pemilu/caleg/partai/3102.json"
  // const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdpr/3102.json"
  // const seats: number = 7
  // const usePT: boolean = true
  // const caption: string = "Perkiraan kursi DPR RI Dapil Jakarta 2. Jumlah Kursi 7: "

  // DPR RI DKI Jakarta 3
  // const urlGetCaleg: string = "https://sirekap-obj-data.kpu.go.id/pemilu/caleg/partai/3103.json"
  // const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdpr/3103.json"
  // const seats: number = 8
  // const usePT: boolean = true
  // const caption: string = "Perkiraan kursi DPR RI Dapil Jakarta 3. Jumlah Kursi 8: "

  // // DPR RI Jabar 1
  // const urlGetCaleg: string = "https://sirekap-obj-data.kpu.go.id/pemilu/caleg/partai/3201.json"
  // const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdpr/3201.json"
  // const seats: number = 7
  // const usePT: boolean = true
  // const caption: string = "Perkiraan kursi DPR RI Dapil Jabar 1. Jumlah Kursi 7: "

  // DPR RI Jabar 5
  // const urlGetCaleg: string = "https://sirekap-obj-data.kpu.go.id/pemilu/caleg/partai/3205.json"
  // const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdpr/3205.json"
  // const seats: number = 9
  // const usePT: boolean = true
  // const caption: string = "Perkiraan kursi DPR RI Dapil Jabar 5. Jumlah Kursi 9: "

  // DPR RI Jabar 11
  // const urlGetCaleg: string = "https://sirekap-obj-data.kpu.go.id/pemilu/caleg/partai/3211.json"
  // const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdpr/3211.json"
  // const seats: number = 10
  // const usePT: boolean = true
  // const caption: string = "Perkiraan kursi DPR RI Dapil Jabar 11. Jumlah Kursi 10: "

  // DPR RI Jabar 7
  // const urlGetCaleg: string = "https://sirekap-obj-data.kpu.go.id/pemilu/caleg/partai/3207.json"
  // const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdpr/3207.json"
  // const seats: number = 10
  // const usePT: boolean = true
  // const caption: string = "Perkiraan kursi DPR RI Dapil Jabar 7. Jumlah Kursi 10: "

  // DPR RI Banten 1
  // const urlGetCaleg: string = "https://sirekap-obj-data.kpu.go.id/pemilu/caleg/partai/3601.json"
  // const urlVoteResult: string = "https://sirekap-obj-data.kpu.go.id/pemilu/hhcd/pdpr/3601.json"
  // const seats: number = 6
  // const usePT: boolean = true
  // const caption: string = "Perkiraan kursi DPR RI Dapil Banten 1. Jumlah Kursi 6: "

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
