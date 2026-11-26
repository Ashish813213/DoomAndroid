import java.io.*;
import java.util.zip.*;

public class AddDex {
    public static void main(String[] args) throws Exception {
        File apk = new File(args[0]);
        File dex = new File(args[1]);
        File out = new File(args[2]);
        byte[] buf = new byte[16384];
        int n;

        ZipInputStream zin = new ZipInputStream(new FileInputStream(apk));
        ZipOutputStream zout = new ZipOutputStream(new BufferedOutputStream(new FileOutputStream(out)));
        ZipEntry e;
        while ((e = zin.getNextEntry()) != null) {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            while ((n = zin.read(buf)) > 0) bos.write(buf, 0, n);
            byte[] data = bos.toByteArray();

            ZipEntry ne = new ZipEntry(e.getName());
            if (e.getMethod() == ZipEntry.STORED) {
                CRC32 crc = new CRC32();
                crc.update(data);
                ne.setMethod(ZipEntry.STORED);
                ne.setSize(data.length);
                ne.setCompressedSize(data.length);
                ne.setCrc(crc.getValue());
            } else {
                ne.setMethod(ZipEntry.DEFLATED);
            }
            if (e.getTime() >= 0) ne.setTime(e.getTime());
            zout.putNextEntry(ne);
            zout.write(data);
            zout.closeEntry();
        }
        zin.close();

        byte[] dexData = new byte[(int) dex.length()];
        try (InputStream in = new FileInputStream(dex)) {
            int off = 0;
            while (off < dexData.length && (n = in.read(dexData, off, dexData.length - off)) > 0) off += n;
        }
        CRC32 crc = new CRC32();
        crc.update(dexData);
        ZipEntry de = new ZipEntry("classes.dex");
        de.setMethod(ZipEntry.STORED);
        de.setSize(dexData.length);
        de.setCompressedSize(dexData.length);
        de.setCrc(crc.getValue());
        zout.putNextEntry(de);
        zout.write(dexData);
        zout.closeEntry();
        zout.close();
    }
}
