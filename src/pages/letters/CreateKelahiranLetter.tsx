import React from 'react';

const CreateKelahiranLetter: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-center text-teal-800">Surat Keterangan Kelahiran</h1>
      <div className="bg-white p-8 border shadow max-w-[800px] mx-auto">
        <div className="flex items-center mb-2">
          <div className="text-center w-full">
            <div className="font-bold text-lg">PEMERINTAH KABUPATEN BUMI MAKMUR SEJAHTERA</div>
            <div className="font-bold text-lg">KECAMATAN MAKMUR JAYA</div>
            <div className="font-bold text-xl">DESA BUMI MAKMUR</div>
            <div className="text-sm">Jl. Raya Desa Bumi Makmur No. 1, Kode Pos 12345</div>
          </div>
        </div>
        <hr className="border-t-2 border-black my-2" />
        <div className="text-center mt-4 mb-2">
          <div className="font-bold underline text-lg">SURAT KETERANGAN KELAHIRAN</div>
          <div className="text-sm">Nomor: 470/_____/BM/____/2024</div>
        </div>
        <div className="mb-2">Yang bertanda tangan di bawah ini Kepala Desa Bumi Makmur, Kecamatan Makmur Jaya, Kabupaten Bumi Makmur Sejahtera, menerangkan bahwa:</div>
        <table className="mb-2">
          <tbody>
            <tr><td>Nama Anak</td><td className="px-2">:</td><td></td></tr>
            <tr><td>Jenis Kelamin</td><td className="px-2">:</td><td></td></tr>
            <tr><td>Tempat/Tgl Lahir</td><td className="px-2">:</td><td></td></tr>
            <tr><td>Nama Ayah</td><td className="px-2">:</td><td></td></tr>
            <tr><td>Pekerjaan Ayah</td><td className="px-2">:</td><td></td></tr>
            <tr><td>Nama Ibu</td><td className="px-2">:</td><td></td></tr>
            <tr><td>Pekerjaan Ibu</td><td className="px-2">:</td><td></td></tr>
            <tr><td>Alamat Orang Tua</td><td className="px-2">:</td><td></td></tr>
          </tbody>
        </table>
        <div className="mb-2">Surat keterangan ini dibuat untuk keperluan administrasi kependudukan dan dapat dipergunakan sebagaimana mestinya.</div>
        <div className="flex justify-end mt-8">
          <div className="text-center">
            <div>Bumi Makmur, .................... 2024</div>
            <div className="font-bold">Kepala Desa Bumi Makmur</div>
            <div style={{ height: '60px' }}></div>
            <div className="font-bold underline">(Nama Kepala Desa)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateKelahiranLetter;
