import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const igDir = path.join(rootDir, 'public', 'assets', 'ig');
const logoSrc = path.join(rootDir, 'logo sandos.jpg');
const logoDest = path.join(rootDir, 'public', 'assets', 'logo-sandos.jpg');

const assets = [
  {
    name: 'avatar.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.82787-19/758328789_18111279275513278_8100163526964561654_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=110&ig_cache_key=GNUtMy2_FaXPHFhAAPZGTK-Pj2lwbmNDAQAB1501500j-ccb7-5&ccb=7-5&_nc_sid=669407&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy4xMDgwLkMzIn0%3D&_nc_ohc=9h979kgHnTYQ7kNvwHSqvPi&_nc_oc=AdoExzgLJOxIVip19IGwjxXHlyjgR5Gw47NMMT9nlbM1RDO9lvN4bE2XoXudKxoNSNk&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=JdL30t5cLMUkvS1Fk61VGA&_nc_ss=79689&_nc_ct=RQosPBUCFQIAAAA&oh=00_AQRiREKbnWNdgDo0u4-K9P1uJa8SY6eD3BmYugbvogJ0bA&oe=6B025A82',
  },
  {
    name: 'hl-clientes.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.71878-15/758264768_911502064678510_6981726335815483884_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=103&ccb=7-5&_nc_sid=acbce5&_nc_ohc=jiPl9X6ukdAQ7kNvwHfIIRO&_nc_oc=Adpq8hzDjJyStcrKlkL0ZhHQcjwpIEiH0aJS3bQbIvCWJfWo08pN84IIaT0SDXPUgO4&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=JdL30t5cLMUkvS1Fk61VGA&_nc_ss=79689&oh=00_AQQytBMwK0klQFmGBQI0uEkL_y90vRALh_EsvBzAd_sWew&oe=6B024CD1',
  },
  {
    name: 'hl-team.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.71878-15/839096080_1122178390208671_612030261707017420_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=102&ccb=7-5&_nc_sid=acbce5&_nc_ohc=RVf86Wv5LMoQ7kNvwEvUMo4&_nc_oc=AdrVsqEO8jzpYXIIOeQ8TVNKPbQH4gf6zWIIfvh0crlTH40qzia6VGQcFEFaynOQbog&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=JdL30t5cLMUkvS1Fk61VGA&_nc_ss=79689&oh=00_AQSCUbinr-5lga_Whxc-kpVpX4HGRqy67OcB0PIHMPncQg&oe=6B0227FD',
  },
  {
    name: 'hl-servicios.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.71878-15/758377236_3605600196255499_7266806324307902035_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=106&ccb=7-5&_nc_sid=acbce5&_nc_ohc=Cnh432_2_7EQ7kNvwE9WWqW&_nc_oc=AdoU7M3kIBTkPCO8KLy43LZrI-GYDBbw7JOLqyNWbUdcfxjbge3RARrXd8paCzpgVdA&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=JdL30t5cLMUkvS1Fk61VGA&_nc_ss=79689&oh=00_AQR49ZLeMiFIlZLE1Slh8T_j3icJOhxCO-5pl7FeztFkRg&oe=6B023E6E',
  },
  {
    name: 'hl-back.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.71878-15/759018592_1613471767059170_8789805628494013540_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=107&ccb=7-5&_nc_sid=acbce5&_nc_ohc=sqJ0ge8DWrsQ7kNvwHJFd8u&_nc_oc=Adqr8aEUHgqiMBmjcXXP1d_R1cm5uEEvaC1HyD2gvaaVIO5B0_AklFJPj-dwGd65yAQ&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=JdL30t5cLMUkvS1Fk61VGA&_nc_ss=79689&oh=00_AQTXV6YU5iUM3IlEI85NGX9OYwg9nKEJ3zl6_lmVcSjCng&oe=6B024A75',
  },
  {
    name: 'hl-studio.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.71878-15/758469160_967525426308755_4968900934537283408_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=101&ccb=7-5&_nc_sid=acbce5&_nc_ohc=A7Inhg9HCZYQ7kNvwGrrlfg&_nc_oc=AdpNf1EW3vpcuRVxvxVtkQJnJKA7C48e3qGRmPe_LfnVI_WidbvZkvF6bupnHHw8ElM&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=JdL30t5cLMUkvS1Fk61VGA&_nc_ss=79689&oh=00_AQSBiqWfJiTQi4C1iRhpS9rPhMS-orGPSnhVTL7ZcYMPWg&oe=6B024BA8',
  },
  {
    name: 'post-01-empresa.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.82787-15/840070258_18120835448513278_3941384411359098157_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=105&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=qhlErm7zHaEQ7kNvwHPzfxK&_nc_oc=Adp9IpHbRWXvLXI9o8ndmxn-x7tkYWLVEINb4881WwIgH5TYIIWZx6G14EYd58ocygE&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=3FAOXgrygqVfp3Ia_p5_ew&_nc_ss=79689&_nc_ct=RQosPBUKFQQAAAA&oh=00_AQRmZU_8TLnEspQlc1-fg7TXqac9jF9q-QAZOFgdkRqtlA&oe=6B0234C4',
  },
  {
    name: 'post-02-founders.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.82787-15/758444431_18111283352513278_5443806196251496494_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=101&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=jqvR0fD0QSAQ7kNvwE0KVJS&_nc_oc=Ado_CUo31i4Q9kWh_Ofm6YsGQkHWPW2dzysyf4mIa-a2S4ciyPCd9vH3LLptTOojfG4&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=3FAOXgrygqVfp3Ia_p5_ew&_nc_ss=79689&_nc_ct=RQosPBUKFQIAAAA&oh=00_AQSP2WiN-Uyhkr9Sm9_0k17x6I-gJkgRRIcQqVe9LUn_jg&oe=6B0243D0',
  },
  {
    name: 'post-03-studio-mic.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.82787-15/588092831_18082317194513278_6249493682137144264_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=100&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=H12uiAlcD10Q7kNvwHcNHs5&_nc_oc=AdpJvWvVZEjbdFSQ18cJZ-2YAaAZ503HjIGelrv1kasOlRnVXWD6s3rHE-HO-iIPhRA&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=3FAOXgrygqVfp3Ia_p5_ew&_nc_ss=79689&_nc_ct=RQosPBUKFQQAAAA&oh=00_AQREU2phltI4yPnfx5Wdca_DWLw6U9SkqACVqYj53wg2Ig&oe=6B0234B8',
  },
  {
    name: 'post-04-dopamina.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.82787-15/905962314_18101921840562876_1221223854229594846_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=100&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=YnmlvuZ0RDMQ7kNvwGkh6on&_nc_oc=AdrMfVjW5m7VPgN7V_Dl1bW9mKJDu-Lqwp8Jy270J3zKnLmUUkrmszU8s4CJge1qLGQ&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=3FAOXgrygqVfp3Ia_p5_ew&_nc_ss=79689&_nc_ct=RQosPBUKFQwAAAA&oh=00_AQRhUlsLzy0wzURKAEMKDZr3gJ9cbPhqKhGGhGEhIjjqWw&oe=6B023367',
  },
  {
    name: 'post-05-aog-card.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.82787-15/865903684_18123265100513278_1132228853907533513_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=101&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=4dgabz1sNO0Q7kNvwGJb0El&_nc_oc=AdoWeK5AsOr6JpYvtE1UuIQcEGnmJnUbiWnceU0Z4PZipKK8RicWEm2SMXuaU6cSrJQ&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=3FAOXgrygqVfp3Ia_p5_ew&_nc_ss=79689&_nc_ct=RQosPBUKFQQAAAA&oh=00_AQRICTUbDu15XaGbb0lRua9csKhEQddoBXu9cmf98dX4Bg&oe=6B024FE4',
  },
  {
    name: 'post-06-comunicacion-ypf.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.82787-15/858545079_18122758049513278_2932058489950553264_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=102&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=p8q4Nsjeo6oQ7kNvwGA6ruH&_nc_oc=Adr9PAJJ-Tnqt2KdRz6_MadlvcAgz_TdxWQ8R3HujFaISSsiOX4JmQTfJyAbQS8XVyc&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=3FAOXgrygqVfp3Ia_p5_ew&_nc_ss=79689&_nc_ct=RQosPBUKFQQAAAA&oh=00_AQS8wUruB3TDGSoAxg4UZ4udqae7bYuLlpyd1n2c3FVMfg&oe=6B0243F7',
  },
  {
    name: 'post-07-solidez.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.82787-15/845530271_18121829099513278_1524039235057469458_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=109&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=xsmEi3G6MBcQ7kNvwGthVIA&_nc_oc=AdqWb4S6dss7jcrEqfTph350HYeU1Gx41dc9qjSjnvZ4rFujcf8EEvTmlfFxL5H86WY&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=3FAOXgrygqVfp3Ia_p5_ew&_nc_ss=79689&_nc_ct=RQosPBUKFQQAAAA&oh=00_AQS2ACCZS4GxPwUP6jkSeQJlhL1f4FXDDngx_E4ChMaF0A&oe=6B024C25',
  },
  {
    name: 'post-08-dos-empresas.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.82787-15/836547552_18120561428513278_7813621144682473979_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=106&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0FST1VTRUxfSVRFTS5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=rZurAGalck0Q7kNvwFFtgyH&_nc_oc=AdrsuEbq73zYCvHqrdtjV8WaUHy7s4XEIfbQbhSA4DlgGNNVnnEj92QwrG27PncJeK8&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=3FAOXgrygqVfp3Ia_p5_ew&_nc_ss=79689&_nc_ct=RQosPBUKFQIAAAA&oh=00_AQQzvdPQwTNr8MpE6n3Cov6MxPjO5TaxYDXAKkaKQwDNkQ&oe=6B023065',
  },
  {
    name: 'post-09-minivlog.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.82787-15/809209121_18118447445513278_1944108056782880589_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=101&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=8kajjzj80_kQ7kNvwGJwN9p&_nc_oc=Adq205I-B9DAH407srZTgOi3oEYOz0tmFSTNQ3KzzoToVWOxiBBfIxECG9tzgSPx5D0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=3FAOXgrygqVfp3Ia_p5_ew&_nc_ss=79689&_nc_ct=RQosPBUKFQQAAAA&oh=00_AQTAYWS5AA72Vf3EHgEE4O_nuG4qTPPQbpYSDZH83giqzw&oe=6B023936',
  },
  {
    name: 'post-10-agenda.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.82787-15/812990861_18118197896513278_7310270455183296551_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=103&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=88ISgiGOaSQQ7kNvwEB1D2J&_nc_oc=AdpOjaG2AMntKy3JJevaP1MBn69AAZzFSme9Gk3AP23LvShxQ8Hg9mUpqxbIp4Vfl7E&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=3FAOXgrygqVfp3Ia_p5_ew&_nc_ss=79689&_nc_ct=RQosPBUKFQQAAAA&oh=00_AQQ91P1_7_rlP-U-2_NJcHHKD63oNm489TFv17aExfoNXg&oe=6B024D94',
  },
  {
    name: 'post-11-neuquen-122.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.82787-15/807577892_18117770405513278_5966641564628940811_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=107&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=7UzO5CXUunkQ7kNvwGVGPcd&_nc_oc=AdrpTpucFiK9mRY3EfTQ6INwFlg1xcCG7SpfUQfY44xNTKHIk0oD5u7PUVfs2lmuRcM&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=3FAOXgrygqVfp3Ia_p5_ew&_nc_ss=79689&_nc_ct=RQosPBUKFQIAAAA&oh=00_AQTdXWZSTIuV9xJAi24eauAaiIrYqct2a5bg_fxyX8wasw&oe=6B0252F9',
  },
  {
    name: 'post-12-studio-dupla.jpg',
    url: 'https://scontent.cdninstagram.com/v/t51.82787-15/785599559_18115563179513278_7479503830658526862_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=108&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=xMf-ZTPBS-0Q7kNvwF18lDn&_nc_oc=Ado_2f7RS5NordbkuAKBrmf53vJodtNusCIKPxO3n3CeZn7ywJUDz8Kx3mi9Y_rywd0&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=3FAOXgrygqVfp3Ia_p5_ew&_nc_ss=79689&_nc_ct=RQosPBUKFQQAAAA&oh=00_AQTs-TbYtGAVwhcFqpwBZ8thajbe5QaD0mWECQJqhHEfGg&oe=6B023D78',
  },
];

async function run() {
  await fs.mkdir(igDir, { recursive: true });
  await fs.copyFile(logoSrc, logoDest);
  console.log(`Copied logo -> ${logoDest}`);

  let failed = 0;
  for (const item of assets) {
    const dest = path.join(igDir, item.name);
    const res = await fetch(item.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        Referer: 'https://www.instagram.com/',
      },
    });
    if (!res.ok) {
      console.error(`FAILED ${item.name}: HTTP ${res.status}`);
      failed++;
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    await fs.writeFile(dest, buf);
    console.log(`OK ${item.name} (${buf.length} bytes)`);
  }

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
