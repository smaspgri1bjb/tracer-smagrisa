// Data referensi untuk dropdown frontend. Sumber kebenaran jangka panjang: Spreadsheet.
// Gunakan: isiDropdown(document.getElementById('sel'), REFERENSI.bidangUsahaList, '-- Pilih bidang usaha --');
var REFERENSI = {
  bidangUsahaList: [
    {kode:'BU-01',label:'Pertanian, Kehutanan & Perikanan'},
    {kode:'BU-02',label:'Pertambangan & Penggalian'},
    {kode:'BU-03',label:'Industri Pengolahan'},
    {kode:'BU-04',label:'Pengadaan Listrik, Gas & Air'},
    {kode:'BU-05',label:'Konstruksi'},
    {kode:'BU-06',label:'Perdagangan Besar & Eceran'},
    {kode:'BU-07',label:'Transportasi & Pergudangan'},
    {kode:'BU-08',label:'Penyediaan Akomodasi & Makan Minum'},
    {kode:'BU-09',label:'Informasi & Komunikasi'},
    {kode:'BU-10',label:'Jasa Keuangan & Asuransi'},
    {kode:'BU-11',label:'Real Estat'},
    {kode:'BU-12',label:'Jasa Perusahaan'},
    {kode:'BU-13',label:'Administrasi Pemerintahan'},
    {kode:'BU-14',label:'Pendidikan'},
    {kode:'BU-15',label:'Kesehatan & Kegiatan Sosial'},
    {kode:'BU-16',label:'Kesenian, Hiburan & Rekreasi'},
    {kode:'BU-17',label:'Jasa Lainnya'},
    {kode:'BU-18',label:'Badan Internasional & Ekstrateritorial'}
  ],
  jenisPekerjaanList: [
    {kode:'JP-01',label:'Karyawan Swasta'},
    {kode:'JP-02',label:'Karyawan BUMN/BUMD'},
    {kode:'JP-03',label:'PNS/ASN'},
    {kode:'JP-04',label:'TNI/Polri'},
    {kode:'JP-05',label:'Guru/Dosen'},
    {kode:'JP-06',label:'Tenaga Kesehatan'},
    {kode:'JP-07',label:'Wiraswasta/Pengusaha'},
    {kode:'JP-08',label:'Pekerja Lepas (Freelance)'},
    {kode:'JP-09',label:'Buruh/Pekerja Lapangan'},
    {kode:'JP-10',label:'Tenaga Administrasi'},
    {kode:'JP-11',label:'Sales/Marketing'},
    {kode:'JP-12',label:'Teknisi/Mekanik'},
    {kode:'JP-13',label:'Programmer/IT Support'},
    {kode:'JP-14',label:'Desainer/Kreatif'},
    {kode:'JP-15',label:'Sopir/Kurir'},
    {kode:'JP-16',label:'Lainnya'}
  ],
  tingkatPenghasilanList: [
    {kode:'PH-1',label:'Kurang dari Rp 1.000.000'},
    {kode:'PH-2',label:'Rp 1.000.000 – Rp 2.000.000'},
    {kode:'PH-3',label:'Rp 2.000.000 – Rp 3.500.000'},
    {kode:'PH-4',label:'Rp 3.500.000 – Rp 5.000.000'},
    {kode:'PH-5',label:'Rp 5.000.000 – Rp 8.000.000'},
    {kode:'PH-6',label:'Rp 8.000.000 – Rp 12.000.000'},
    {kode:'PH-7',label:'Lebih dari Rp 12.000.000'}
  ]
};

function isiDropdown(selectElement, list, placeholder) {
  if (!selectElement) return;
  var opts = '<option value="">'+(placeholder || '-- Pilih --')+'</option>';
  for (var i = 0; i < list.length; i++) {
    opts += '<option value="'+esc(list[i].kode)+'">'+esc(list[i].label)+'</option>';
  }
  selectElement.innerHTML = opts;
}

function refLabel(list, kode) {
  for (var i = 0; i < list.length; i++) if (list[i].kode === kode) return list[i].label;
  return kode;
}