# Heightary

브라우저 안에서 캐릭터 이미지를 등록하고 실제 키 비율로 비교하는 Vercel-ready 웹 앱입니다.

## 실행

```bash
npm install
npm run dev
```

## 데이터 저장

- 캐릭터 정보와 이미지(Data URL)는 IndexedDB의 `heightary-db`에 저장됩니다.
- 정렬 방식과 단위 같은 작은 UI 설정만 LocalStorage에 저장됩니다.
- 설정 메뉴의 **모든 데이터 비우기**를 누르면 두 저장소를 모두 초기화합니다.
